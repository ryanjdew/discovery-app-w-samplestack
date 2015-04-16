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
	 * Exposes endpoint that returns CSRF token information and a session for use in login.
	 * @param request The Http Request.
	 * @param response The Http response.
	 * @return A JsonNode with bare-bones acknowledgement.
	 */
	@RequestMapping(value = "server/charts", method = RequestMethod.GET)
	public @ResponseBody ObjectNode getCharts() {
		return setupService.findChartData();
	}

	/**
	 * Exposes endpoint that returns CSRF token information and a session for use in login.
	 * @param request The Http Request.
	 * @param response The Http response.
	 * @return A JsonNode with bare-bones acknowledgement.
	 */
	@RequestMapping(value = "server/charts", method = RequestMethod.PUT)
	public @ResponseBody ObjectNode setCharts(@RequestBody ObjectNode charts) {
		return setupService.setChartData(charts);
	}

	
	/**
	 * Exposes endpoint that returns CSRF token information and a session for use in login.
	 * @param request The Http Request.
	 * @param response The Http response.
	 * @return A JsonNode with bare-bones acknowledgement.
	 */
	@RequestMapping(value = "server/database/properties", method = RequestMethod.GET)
	public @ResponseBody ObjectNode getDatabaseProperties() {
		return setupService.getDatabaseProperties();
	}
	
	/**
	 * Exposes endpoint that returns CSRF token information and a session for use in login.
	 * @param request The Http Request.
	 * @param response The Http response.
	 * @return A JsonNode with bare-bones acknowledgement.
	 */
	@RequestMapping(value = "server/database/range-indexes", method = RequestMethod.PUT)
	public @ResponseBody ObjectNode setRangeIndexes(@RequestBody ObjectNode indexes) {
		return setupService.setIndexes(indexes);
	}
	
	/**
	 * Exposes endpoint that returns CSRF token information and a session for use in login.
	 * @param request The Http Request.
	 * @param response The Http response.
	 * @return A JsonNode with bare-bones acknowledgement.
	 */
	@RequestMapping(value = "server/database/fields", method = RequestMethod.PUT)
	public @ResponseBody ObjectNode setFields(@RequestBody ObjectNode fields) {
		return setupService.setFields(fields);
	}

	/**
	 * Exposes endpoint that returns CSRF token information and a session for use in login.
	 * @param request The Http Request.
	 * @param response The Http response.
	 * @return A JsonNode with bare-bones acknowledgement.
	 */
	@RequestMapping(value = "server/search-options", method = RequestMethod.GET)
	public @ResponseBody ObjectNode getSearchOptions() {
		return setupService.findSearchOptions();
	}

	/**
	 * Exposes endpoint that returns CSRF token information and a session for use in login.
	 * @param request The Http Request.
	 * @param response The Http response.
	 * @return A JsonNode with bare-bones acknowledgement.
	 */
	@RequestMapping(value = "server/search-options", method = RequestMethod.PUT)
	public @ResponseBody ObjectNode setSearchOptions(@RequestBody ObjectNode searchOptions) {
		return setupService.setSearchOptions(searchOptions);
	}

	@RequestMapping(value = "server/database/content-metadata", method = RequestMethod.GET)
	public @ResponseBody ObjectNode getContentMetadata(@RequestParam(required = true) String localname,
			@RequestParam(required = false) String type) {
		return setupService.findContentMetadata(localname, type);
	}
	
	@RequestMapping(value = "server/database/load-data", method = RequestMethod.GET)
	public @ResponseBody ObjectNode loadData(@RequestParam(required = true) String directory) {
		return setupService.loadData(directory);
	}
}
