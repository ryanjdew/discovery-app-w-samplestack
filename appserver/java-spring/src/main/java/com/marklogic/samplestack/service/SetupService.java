package com.marklogic.samplestack.service;

import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * Defines the methods for getting tags related to a particular one via
 * a semantic relationship, stored on the server as a REST
 * resource extension.
 * 
 * This service is fully functioning as part of the middle tier, but is
 * not exposed in the UI in 1.0.0
 */
public interface SetupService {

	public ObjectNode getDatabaseProperties();
	
	public ObjectNode findContentMetadata(String localname, String type);

	public ObjectNode setIndexes(ObjectNode indexes);

	public ObjectNode setFields(ObjectNode fields);

	public ObjectNode findSearchOptions();

	public ObjectNode setSearchOptions(ObjectNode searchOptions);
	
	public ObjectNode loadData(String directory);
	
	public ObjectNode findChartData();
	
	public ObjectNode setChartData(ObjectNode chartData);
	
	public ObjectNode setSuggestionOption(ObjectNode chartData);
	
	public ObjectNode getSuggestionOption();
	
	public ObjectNode setUiConfig(ObjectNode uiConfigData);
	
	public ObjectNode getUiConfig();

	public ObjectNode getDatabases();

	public ObjectNode setDatabase(ObjectNode databaseProps);

	public ObjectNode setGeospatialIndexes(ObjectNode indexes);
}