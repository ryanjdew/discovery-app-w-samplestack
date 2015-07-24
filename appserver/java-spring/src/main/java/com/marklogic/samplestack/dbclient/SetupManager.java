/*
 * Copyright 2012-2015 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.samplestack.dbclient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.admin.QueryOptionsManager;
import com.marklogic.client.document.DocumentPatchBuilder;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.samplestack.MarkLogicUtilities;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.SetupService;

/**
 * Implementation of the RelatedTags service. This class is an example of
 * client-side support for a MarkLogic REST API Service extension. The extension
 * name is "relatedTags" and it's implemented in JavaScript.
 * <p/>
 * See <a href="http://google.com">http://docs.marklogic.com/guide/rest-dev/
 * extensions</a> See <a
 * href="http://google.com">http://docs.marklogic.com/guide
 * /java/resourceservices</a>
 * <p/>
 * The extension code is at /database/services/relatedTags.sjs
 */
@Component
public class SetupManager extends ResourceManager implements SetupService {

	@Autowired
	private Clients clients;

	@Autowired
	private ManagementClient managementClient;

	@Autowired
	private MarkLogicUtilities utilities;

	@Autowired
	protected ObjectMapper mapper;

	@SuppressWarnings("unused")
	private final Logger logger = LoggerFactory.getLogger(SetupManager.class);

	/**
	 * Returns a list of matching element types.
	 * 
	 * @param localname
	 *            String specifying the content structure to search for
	 * @param type
	 *            String specifying the type of content structure to search for
	 * @return An ObjectNode with the search options.
	 */
	@Override
	public ObjectNode findContentMetadata(String localname, String type) {
		clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).init(
				"content-metadata", this); // is this expensive?
		RequestParameters params = new RequestParameters();
		params.add("localname", localname);
		params.add("type", type);
		params.add("mode", "json");
		String[] mimetypes = new String[] { "application/json" };

		ServiceResultIterator resultIterator = getServices().get(params,
				mimetypes);

		ObjectNode results = null;
		if (resultIterator.hasNext()) {
			ServiceResult result = resultIterator.next();
			results = (ObjectNode) result.getContent(new JacksonHandle()).get();
		}
		return results;
	}

	/**
	 * Sets the range indexes in the database properties.
	 * 
	 * @param indexes
	 *            ObjectNode containing a list of range indexes.
	 * @return An ObjectNode with the list of range indexes.
	 */
	@Override
	public ObjectNode setIndexes(ObjectNode indexes) {
		managementClient.setRangeIndexes(indexes);
		return indexes;
	}

	/**
	 * Sets the fields in the database properties.
	 * 
	 * @param indexes
	 *            ObjectNode containing a list of fields.
	 * @return An ObjectNode with the list of range indexes.
	 */
	@Override
	public ObjectNode setFields(ObjectNode fields) {
		managementClient.setFields(fields);
		return fields;
	}

	/**
	 * Returns the default search options.
	 * 
	 * @return An ObjectNode with the search options.
	 */
	@Override
	public ObjectNode findSearchOptions() {
		return utilities.getSearchOptions("all");
	}

	/**
	 * Sets the default search options.
	 * 
	 * @param searchOptions
	 *            an ObjectNode to set the search options
	 * @return An ObjectNode with the search options.
	 */
	@Override
	public ObjectNode setSearchOptions(ObjectNode searchOptions) {
		QueryOptionsManager optsManager = clients
				.get(ClientRole.SAMPLESTACK_CONTRIBUTOR)
				.newServerConfigManager().newQueryOptionsManager(); // is this
																	// expensive?
		JacksonHandle responseHandle = new JacksonHandle(searchOptions);
		optsManager.writeOptions("all", responseHandle);
		return searchOptions;
	}

	/**
	 * Loads data
	 * 
	 * @param directory
	 *            String of directory to load into DB.
	 * @return ObjectNode
	 */
	@Override
	public ObjectNode loadData(String directory) {
		ObjectNode docNode = mapper.createObjectNode();
		clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).init("load-data", this); // is
																					// this
																					// expensive?
		RequestParameters params = new RequestParameters();
		params.add("directory", directory);
		String[] mimetypes = new String[] { "application/json" };

		ServiceResultIterator resultIterator = getServices().post(params,
				new JacksonHandle(docNode), mimetypes);

		ObjectNode results = null;
		if (resultIterator.hasNext()) {
			ServiceResult result = resultIterator.next();
			results = (ObjectNode) result.getContent(new JacksonHandle()).get();
		}
		return results;
	}

	/**
	 * Gets database properties from the server.
	 * 
	 * @return ObjectNode
	 */
	@Override
	public ObjectNode getDatabaseProperties() {
		return managementClient.getDatabaseProperties(clients.getDatabase());
	}

	/**
	 * Gets chart data from the server.
	 * 
	 * @return ObjectNode
	 */
	@Override
	public ObjectNode findChartData() {
		JSONDocumentManager docMgr = clients.get(ClientRole.SAMPLESTACK_ADMIN)
				.newJSONDocumentManager();
		JacksonHandle responseHandle = new JacksonHandle();
		docMgr.read("/discovery-app/config/charts.json", responseHandle);
		return (ObjectNode) responseHandle.get();
	}

	/**
	 * Sets chart data in database.
	 * 
	 * @param chartData
	 *            An input tag to check for related tags.
	 * @return ObjectNode.
	 */
	@Override
	public ObjectNode setChartData(ObjectNode chartData) {
		JSONDocumentManager docMgr = clients.get(ClientRole.SAMPLESTACK_ADMIN)
				.newJSONDocumentManager();
		docMgr.write("/discovery-app/config/charts.json", new JacksonHandle(
				chartData));
		return chartData;
	}

	/**
	 * Sets the suggestion default source.
	 * 
	 * @param searchOptions
	 *            an ObjectNode to set the search options
	 * @return An ObjectNode with the search options.
	 */
	@Override
	public ObjectNode setSuggestionOption(ObjectNode searchOptions) {
		QueryOptionsManager optsManager = clients
				.get(ClientRole.SAMPLESTACK_ADMIN).newServerConfigManager()
				.newQueryOptionsManager(); // is this expensive?
		JacksonHandle responseHandle = new JacksonHandle(searchOptions);
		optsManager.writeOptions("opt-suggest", responseHandle);
		return searchOptions;
	}

	/**
	 * Sets the default search options.
	 * 
	 * @param searchOptions
	 *            an ObjectNode to set the search options
	 * @return An ObjectNode with the search options.
	 */
	@Override
	public ObjectNode getSuggestionOption() {
		try {
			return utilities.getSearchOptions("opt-suggest");
		} catch (ResourceNotFoundException e) {
			logger.error("No suggestion default source set.", e);
			return null;
		}
	}

	/**
	 * Sets the suggestion default source.
	 * 
	 * @param searchOptions
	 *            an ObjectNode to set the search options
	 * @return An ObjectNode with the search options.
	 */
	@Override
	public ObjectNode setUiConfig(ObjectNode uiConfig) {
		JSONDocumentManager docMgr = clients.get(ClientRole.SAMPLESTACK_ADMIN)
				.newJSONDocumentManager();
		docMgr.write("/discovery-app/config/ui_config.json", new JacksonHandle(
				uiConfig));
		return uiConfig;
	}

	/**
	 * Sets the default search options.
	 * 
	 * @param searchOptions
	 *            an ObjectNode to set the search options
	 * @return An ObjectNode with the search options.
	 */
	@Override
	public ObjectNode getUiConfig() {
		JSONDocumentManager docMgr = clients.get(ClientRole.SAMPLESTACK_ADMIN)
				.newJSONDocumentManager();
		JacksonHandle responseHandle = new JacksonHandle();
		docMgr.read("/discovery-app/config/ui_config.json", responseHandle);
		return (ObjectNode) responseHandle.get();
	}

	/**
	 * Gets the list of databases to choose from
	 * 
	 */
	@Override
	public ObjectNode getDatabases() {
		return managementClient.getDatabases();
	}

	@Override
	public ObjectNode setDatabase(ObjectNode databaseProps) {
		String dbName = databaseProps.get("database-name").asText();
		if (!managementClient.databaseExists(dbName)) {
			managementClient.createDatabase(dbName);
		}
		clients.setDatabase(dbName);
		JSONDocumentManager docMgr = clients.get(ClientRole.SAMPLESTACK_ADMIN)
				.newJSONDocumentManager();
		DocumentPatchBuilder builder = docMgr.newPatchBuilder();
		builder.replaceValue("/server-config/database", dbName);
		docMgr.patch("/discovery-app/config/server_config.json",
				builder.build());
		return databaseProps;
	}

	@Override
	public ObjectNode setGeospatialIndexes(ObjectNode indexes) {
		managementClient.setGeospatialIndexes(indexes);
		return indexes;
	}
}
