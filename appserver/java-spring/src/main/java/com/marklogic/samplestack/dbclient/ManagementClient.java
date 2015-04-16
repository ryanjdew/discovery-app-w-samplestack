package com.marklogic.samplestack.dbclient;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.security.ClientRole;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.Credentials;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;

public class ManagementClient {
	
	@SuppressWarnings("unused")
	private final Logger logger = LoggerFactory
			.getLogger(ManagementClient.class);
	
	private int port = 8002;
	private String host;
	private String username;
	private String password;
	private String database;
	private DefaultHttpClient client;
	private HttpHost target;
	private ClientRole admin = ClientRole.SAMPLESTACK_ADMIN;
	
	public ManagementClient(Environment env) {
		host = env.getProperty("marklogic.rest.host");
		username = env.getProperty(admin.getUserParam());
		password = env.getProperty(admin.getPasswordParam());
		database = env.getProperty("marklogic.rest.name");
		client = new DefaultHttpClient();
		target = new HttpHost(host, port, "http");
		Credentials defaultcreds = new UsernamePasswordCredentials(username, password);
		client.getCredentialsProvider().setCredentials(new AuthScope(host, port, AuthScope.ANY_REALM), defaultcreds);
	}
	
	public ObjectNode getDatabaseProperties() {
		HttpGet getProperties = new HttpGet("/manage/v2/databases/"+database+"/properties?format=json");
		ObjectNode properties = null;
		try {
			HttpResponse response = client.execute(target, getProperties);
			HttpEntity entity = response.getEntity();
			InputStream inputStream = entity.getContent();
			StringWriter writer = new StringWriter();
			IOUtils.copy(inputStream, writer, "UTF-8");
			String jsonString = writer.toString();
			ObjectMapper mapper = new ObjectMapper();
			properties = mapper.readValue(jsonString,ObjectNode.class);
			IOUtils.closeQuietly(inputStream);
			EntityUtils.consume(entity);
		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return properties;
	}
	
	public void setDatabaseProperties(ObjectNode properties) {
		HttpPut putProperties = new HttpPut("/manage/v2/databases/"+database+"/properties?format=json");
		try {
			String requestContent = properties.toString();
	        StringEntity sendEntity = new StringEntity(requestContent);
	        putProperties.setEntity(sendEntity);
	        putProperties.setHeader("Content-Type", "application/json");
			HttpResponse response = client.execute(target, putProperties);
			HttpEntity entity = response.getEntity();
			EntityUtils.consume(entity);
		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
	}

	
	public void setRangeIndexes(ObjectNode rangeIndexes) {
		ObjectNode properties = getDatabaseProperties();
		ArrayNode rangeElementIndexes = properties.putArray("range-element-index");
		ArrayNode rangeElementAttributeIndexes = properties.putArray("range-element-attribute-index");
		ArrayNode rangePathIndexes = properties.putArray("range-path-index");
		ArrayNode rangeFieldIndexes = properties.putArray("range-field-index");
		for (JsonNode index: (ArrayNode)rangeIndexes.get("range-index-list")) {
			ObjectNode indexObj = (ObjectNode) index;
			if (indexObj.get("range-element-index") != null) {
				rangeElementIndexes.add(indexObj.get("range-element-index"));
			} else if (indexObj.get("range-element-attribute-index") != null) {
				rangeElementAttributeIndexes.add(indexObj.get("range-element-attribute-index"));
			} else if (indexObj.get("range-path-index") != null) {
				rangePathIndexes.add(indexObj.get("range-path-index"));
			} else if (indexObj.get("range-field-index") != null) {
				rangeFieldIndexes.add(indexObj.get("range-field-index"));
			}
		}
		setDatabaseProperties(properties);
	}
	
	public void setFields(ObjectNode fields) {
		ObjectNode properties = getDatabaseProperties();
		ArrayNode newFields = properties.putArray("field");
		for (JsonNode index: (ArrayNode)fields.get("field-list")) {
			ObjectNode indexObj = (ObjectNode) index;
			newFields.add(indexObj);
		}
		setDatabaseProperties(properties);	
	}
	
	public void destroy() {
		client.getConnectionManager().shutdown();
	}
}
