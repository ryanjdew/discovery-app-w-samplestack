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
package com.marklogic.samplestack.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.service.SetupService;

/**
 * Controller to provide initial session information to the browser,
 * for CSRF protection and Login session.
 */
@RestController
public class SetupController {

	@Autowired
	private JsonHttpResponse errors;

	@Autowired 
	private ObjectMapper mapper;

	@Autowired
	private SetupService setupService;

	/**
	 * Exposes endpoint that returns the application's chart data
	 * @return An ObjectNode with with the chart information
	 */
	@RequestMapping(value = "server/charts", method = RequestMethod.GET)
	public @ResponseBody ObjectNode getCharts() {
		return setupService.findChartData();
	}

	/**
	 * Exposes endpoint that sets the application's chart data
	 * @param charts The object .
	 * @return An ObjectNode with with the chart information
	 */
	@RequestMapping(value = "server/charts", method = RequestMethod.PUT)
	public @ResponseBody ObjectNode setCharts(@RequestBody ObjectNode charts) {
		return setupService.setChartData(charts);
	}

	
	/**
	 * Exposes endpoint that sets the database used.
	 * @param indexes ObjectNode containing a list of range indexes.
	 * @return An ObjectNode with the list of range indexes.
	 */
	@RequestMapping(value = "server/database", method = RequestMethod.PUT)
	public @ResponseBody ObjectNode setDatabase(@RequestBody ObjectNode databaseProps) {
		return setupService.setDatabase(databaseProps);
	}

	/**
	 * Exposes endpoint that returns the database properties.
	 * @return A JsonNode with the database properties.
	 */
	@RequestMapping(value = "server/database/properties", method = RequestMethod.GET)
	public @ResponseBody ObjectNode getDatabaseProperties() {
		return setupService.getDatabaseProperties();
	}
	
	/**
	 * Exposes endpoint that sets the range indexes in the database properties.
	 * @param indexes ObjectNode containing a list of range indexes.
	 * @return An ObjectNode with the list of range indexes.
	 */
	@RequestMapping(value = "server/database/range-indexes", method = RequestMethod.PUT)
	public @ResponseBody ObjectNode setRangeIndexes(@RequestBody ObjectNode indexes) {
		return setupService.setIndexes(indexes);
	}
	
	/**
	 * Exposes endpoint that sets the geospatial indexes in the database properties.
	 * @param indexes ObjectNode containing a list of geospatial indexes.
	 * @return An ObjectNode with the list of range indexes.
	 */
	@RequestMapping(value = "server/database/geospatial-indexes", method = RequestMethod.PUT)
	public @ResponseBody ObjectNode setGeospatialIndexes(@RequestBody ObjectNode indexes) {
		return setupService.setGeospatialIndexes(indexes);
	}
	
	/**
	 * Exposes endpoint that sets the fields in the database properties.
	 * @param indexes ObjectNode containing a list of fields.
	 * @return An ObjectNode with the list of range indexes.
	 */
	@RequestMapping(value = "server/database/fields", method = RequestMethod.PUT)
	public @ResponseBody ObjectNode setFields(@RequestBody ObjectNode fields) {
		return setupService.setFields(fields);
	}

	/**
	 * Exposes endpoint that returns the default search options.
	 * @return An ObjectNode with the search options.
	 */
	@RequestMapping(value = "server/search-options", method = RequestMethod.GET)
	public @ResponseBody ObjectNode getSearchOptions() {
		return setupService.findSearchOptions();
	}

	/**
	 * Exposes endpoint that sets the default search options.
	 * @param searchOptions an ObjectNode to set the search options
	 * @return An ObjectNode with the search options.
	 */
	@RequestMapping(value = "server/search-options", method = RequestMethod.PUT)
	public @ResponseBody ObjectNode setSearchOptions(@RequestBody ObjectNode searchOptions) {
		return setupService.setSearchOptions(searchOptions);
	}

	/**
	 * Exposes endpoint that returns a list of matching element types.
	 * @param localname String specifying the content structure to search for
	 * @param type String specifying the type of content structure to search for
	 * @return An ObjectNode with the search options.
	 */
	@RequestMapping(value = "server/databases", method = RequestMethod.GET)
	public @ResponseBody ObjectNode getDatabases() {
		return setupService.getDatabases();
	}
	
	/**
	 * Exposes endpoint that returns a list of matching element types.
	 * @param localname String specifying the content structure to search for
	 * @param type String specifying the type of content structure to search for
	 * @return An ObjectNode with the search options.
	 */
	@RequestMapping(value = "server/database/content-metadata", method = RequestMethod.GET)
	public @ResponseBody ObjectNode getContentMetadata(@RequestParam(required = true) String localname,
			@RequestParam(required = false) String type) {
		return setupService.findContentMetadata(localname, type);
	}
	
	/**
	 * Exposes endpoint that loads data from the specified local directory.
	 * @param directory String specifying the directory to load
	 * @return An ObjectNode with the search options.
	 */
	@RequestMapping(value = "server/database/load-data", method = RequestMethod.GET)
	public @ResponseBody ObjectNode loadData(@RequestParam(required = true) String directory) {
		return setupService.loadData(directory);
	}
	
	/**
	 * Exposes endpoint that sets the suggestion default source.
	 * @param indexes ObjectNode containing a list of range indexes.
	 * @return An ObjectNode with the list of range indexes.
	 */
	@RequestMapping(value = "server/database/defaultsource", method = RequestMethod.PUT)
	public @ResponseBody ObjectNode setSuggestionOption(@RequestBody ObjectNode indexes) {
		return setupService.setSuggestionOption(indexes);
	}
	
	/**
	 * Exposes endpoint that gets the suggestion default source.
	 * @param indexes ObjectNode containing a list of range indexes.
	 * @return An ObjectNode with the list of range indexes.
	 */
	@RequestMapping(value = "server/database/defaultsource", method = RequestMethod.GET)
	public @ResponseBody ObjectNode getSuggestionOption() {
		return setupService.getSuggestionOption();
	}
	
	/**
	 * Exposes endpoint that returns the application's ui config data
	 * @return An ObjectNode with with the ui config information
	 */
	@RequestMapping(value = "server/ui_config", method = RequestMethod.GET)
	public @ResponseBody ObjectNode getUiConfig() {
		return setupService.getUiConfig();
	}

	/**
	 * Exposes endpoint that sets the application's ui config data
	 * @param charts The object .
	 * @return An ObjectNode with with the ui config information
	 */
	@RequestMapping(value = "server/ui_config", method = RequestMethod.PUT)
	public @ResponseBody ObjectNode setUiConfig(@RequestBody ObjectNode uiConfig) {
		return setupService.setUiConfig(uiConfig);
	}
}
