package com.marklogic.samplestack.dbclient;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.Credentials;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.security.ClientRole;

public class ManagementClient {

	@SuppressWarnings("unused")
	private final Logger logger = LoggerFactory
			.getLogger(ManagementClient.class);

	@Autowired
	protected Clients clients;

	@Autowired
	protected ObjectMapper mapper;

	private int port = 8002;
	private String host;
	private String username;
	private String password;
	private DefaultHttpClient client;
	private HttpHost target;
	private ClientRole admin = ClientRole.SAMPLESTACK_ADMIN;
	private String hostName;

	public ManagementClient(Environment env) {
		ThreadSafeClientConnManager poolingConnManager = new ThreadSafeClientConnManager();
		host = env.getProperty("marklogic.rest.host");
		username = env.getProperty(admin.getUserParam());
		password = env.getProperty(admin.getPasswordParam());
		client = new DefaultHttpClient(poolingConnManager);
		target = new HttpHost(host, port, "http");
		Credentials defaultcreds = new UsernamePasswordCredentials(username,
				password);
		client.getCredentialsProvider().setCredentials(
				new AuthScope(host, port, AuthScope.ANY_REALM), defaultcreds);
	}

	public String getHostName() {
		if (hostName == null) {
			HttpGet getHosts = new HttpGet("/manage/v2/hosts?format=json");
			ObjectNode hosts = getResponse(getHosts);
			JsonNode hostInfo = hosts.get("host-default-list")
					.get("list-items").get("list-item").get(0);
			hostName = hostInfo.get("nameref").asText();
		}
		return hostName;
	}

	public ObjectNode getDatabases() {
		HttpGet getDatabases = new HttpGet("/manage/v2/databases?format=json");
		ObjectNode databases = getResponse(getDatabases);
		return databases;
	}

	public ObjectNode getDatabaseProperties(String database) {
		HttpGet getProperties = new HttpGet("/manage/v2/databases/" + database
				+ "/properties?format=json");
		ObjectNode properties = getResponse(getProperties);
		return properties;
	}

	public void setDatabaseProperties(String database, ObjectNode properties) {
		HttpPut putProperties = new HttpPut("/manage/v2/databases/" + database
				+ "/properties?format=json");
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

	public void createDatabase(String database) {
		HttpPost postDatabase = new HttpPost("/manage/v2/databases?format=json");
		ObjectNode docNode = mapper.createObjectNode();
		docNode.put("database-name", database);
		ArrayNode forests = docNode.putArray("forest");
		forests.add(database + "-001");
		forests.add(database + "-002");
		forests.add(database + "-003");
		for (JsonNode forest : forests) {
			createForest(forest.asText());
		}
		try {
			String requestContent = docNode.toString();
			StringEntity sendEntity = new StringEntity(requestContent);
			postDatabase.setEntity(sendEntity);
			postDatabase.setHeader("Content-Type", "application/json");
			HttpResponse response = client.execute(target, postDatabase);
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

	public void createForest(String forest) {
		HttpPost postDatabase = new HttpPost("/manage/v2/forests?format=json");
		ObjectNode docNode = mapper.createObjectNode();
		docNode.put("forest-name", forest);
		docNode.put("host", getHostName());
		try {
			String requestContent = docNode.toString();
			StringEntity sendEntity = new StringEntity(requestContent);
			postDatabase.setEntity(sendEntity);
			postDatabase.setHeader("Content-Type", "application/json");
			HttpResponse response = client.execute(target, postDatabase);
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
		String database = clients.getDatabase();
		ObjectNode properties = mapper.createObjectNode();
		ArrayNode rangeElementIndexes = properties
				.putArray("range-element-index");
		ArrayNode rangeElementAttributeIndexes = properties
				.putArray("range-element-attribute-index");
		ArrayNode rangePathIndexes = properties.putArray("range-path-index");
		ArrayNode rangeFieldIndexes = properties.putArray("range-field-index");
		for (JsonNode index : (ArrayNode) rangeIndexes.get("range-index-list")) {
			ObjectNode indexObj = (ObjectNode) index;
			if (indexObj.get("range-element-index") != null) {
				rangeElementIndexes.add(indexObj.get("range-element-index"));
			} else if (indexObj.get("range-element-attribute-index") != null) {
				rangeElementAttributeIndexes.add(indexObj
						.get("range-element-attribute-index"));
			} else if (indexObj.get("range-path-index") != null) {
				rangePathIndexes.add(indexObj.get("range-path-index"));
			} else if (indexObj.get("range-field-index") != null) {
				rangeFieldIndexes.add(indexObj.get("range-field-index"));
			}
		}
		setDatabaseProperties(database, properties);
	}

	public void setGeospatialIndexes(ObjectNode geospatialIndexes) {
		String database = clients.getDatabase();
		ObjectNode properties = mapper.createObjectNode();
		ArrayNode geospatialElementIndexes = properties
				.putArray("geospatial-element-index");
		ArrayNode geospatialElementPairIndexes = properties
				.putArray("geospatial-element-pair-index");
		for (JsonNode index : (ArrayNode) geospatialIndexes
				.get("geospatial-index-list")) {
			ObjectNode indexObj = (ObjectNode) index;
			if (indexObj.get("geospatial-element-index") != null) {
				geospatialElementIndexes.add(indexObj
						.get("geospatial-element-index"));
			} else if (indexObj.get("geospatial-element-pair-index") != null) {
				geospatialElementPairIndexes.add(indexObj
						.get("geospatial-element-pair-index"));
			}
		}
		setDatabaseProperties(database, properties);
	}

	public void setFields(ObjectNode fields) {
		String database = clients.getDatabase();
		ObjectNode properties = mapper.createObjectNode();
		ArrayNode newFields = properties.putArray("field");
		for (JsonNode index : (ArrayNode) fields.get("field-list")) {
			ObjectNode indexObj = (ObjectNode) index;
			newFields.add(indexObj);
		}
		setDatabaseProperties(database, properties);
	}

	public void destroy() {
		client.getConnectionManager().shutdown();
	}

	public boolean databaseExists(String database) {
		HttpGet getDB = new HttpGet("/manage/v2/databases/" + database
				+ "?format=json");
		boolean exists = false;
		try {
			HttpResponse response = client.execute(target, getDB);
			HttpEntity entity = response.getEntity();
			InputStream inputStream = entity.getContent();
			StringWriter writer = new StringWriter();
			IOUtils.copy(inputStream, writer, "UTF-8");
			IOUtils.closeQuietly(inputStream);
			EntityUtils.consume(entity);
			int statusCode = response.getStatusLine().getStatusCode();
			exists = statusCode >= 200 && statusCode < 300;
		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return exists;
	}

	private ObjectNode getResponse(HttpRequest request) {
		ObjectNode resp = null;
		try {
			HttpResponse response = client.execute(target, request);
			HttpEntity entity = response.getEntity();
			InputStream inputStream = entity.getContent();
			StringWriter writer = new StringWriter();
			IOUtils.copy(inputStream, writer, "UTF-8");
			String jsonString = writer.toString();
			ObjectMapper mapper = new ObjectMapper();
			resp = mapper.readValue(jsonString, ObjectNode.class);
			IOUtils.closeQuietly(inputStream);
			EntityUtils.consume(entity);
		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return resp;
	}
}
