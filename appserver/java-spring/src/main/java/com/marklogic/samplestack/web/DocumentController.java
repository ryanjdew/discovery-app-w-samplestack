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

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.samplestack.MarkLogicUtilities;
import com.marklogic.samplestack.exception.SamplestackSearchException;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.service.DocumentService;

/**
 * Controller to handle endpoints related to questions and answers.
 */
@RestController
public class DocumentController {

	private final Logger logger = LoggerFactory
			.getLogger(DocumentController.class);

	@Autowired
	private DocumentService docService;

	@Autowired
	ObjectMapper mapper;

	@Autowired
	private ContributorService contributorService;

	@Autowired
	private MarkLogicUtilities utilities;

	/**
	 * Searches for QnADocuments and returns search results to request body
	 * 
	 * @param q
	 *            A search string (See Search API docs)
	 * @param start
	 *            The index of the first return result.
	 * @return A Search API JSON response containing matches, facets and
	 *         snippets.
	 */
	@RequestMapping(value = "v1/documents", method = RequestMethod.GET, produces = "application/xml")
	public @ResponseBody byte[] getDocuments(HttpServletResponse response,
			@RequestParam(required = true) String uri,
			@RequestParam(required = false) String transform,
			@RequestParam(required = false, defaultValue = "json") String format) {
		if (format != "binary") {
			response.setContentType("application/" + format);
		}
		ServerTransform serverTransform = null;
		if (transform != null) {
			serverTransform = new ServerTransform(transform);
		}
		return docService.get(uri, serverTransform);
	}

	/**
	 * Exposes an endpoint for searching QnADocuments.
	 * 
	 * @param combinedQuery
	 *            A JSON combined query.
	 * @param start
	 *            The index of the first result to return.
	 * @return A Search Results JSON response.
	 */
	@RequestMapping(value = "v1/search", method = RequestMethod.POST)
	public @ResponseBody JsonNode search(
			@RequestBody ObjectNode combinedQuery,
			@RequestParam(defaultValue = "10", required = false) long pageLength,
			@RequestParam(defaultValue = "1", required = false) long start,
			@RequestParam(defaultValue = "", required = false) String qtext,
			@RequestParam(defaultValue = "all", required = false) String options) {

		ObjectNode combinedSearchObject = (ObjectNode) combinedQuery
				.get("search");
		ObjectNode combinedQueryObject = (ObjectNode) combinedQuery
				.get("query");
		if (combinedSearchObject == null && combinedQueryObject == null) {
			combinedSearchObject = mapper.createObjectNode();
		} 
		if (combinedSearchObject != null
				&& combinedSearchObject.get("qtext") == null) {
			combinedSearchObject.put("qtext", qtext);
		}
		JsonNode postedStartNode = combinedQueryObject.get("start");
		if (postedStartNode != null) {
			start = postedStartNode.asLong();
			combinedQueryObject.remove("start");
		}
		return docService.rawSearch(ClientRole.securityContextRole(),
				combinedQuery, options, start, pageLength);
	}

	/**
	 * Exposes an endpoint for searching QnADocuments.
	 * 
	 * @param combinedQuery
	 *            A JSON combined query.
	 * @param start
	 *            The index of the first result to return.
	 * @return A Search Results JSON response.
	 */
	@RequestMapping(value = "v1/search", method = RequestMethod.GET)
	public @ResponseBody JsonNode getSearch(
			@RequestParam(defaultValue = "{}", required = false) String structuredQuery,
			@RequestParam(defaultValue = "1", required = false) long start,
			@RequestParam(defaultValue = "10", required = false) long pageLength,
			@RequestParam(defaultValue = "", required = false) String qtext,
			@RequestParam(defaultValue = "all", required = false) String options) {
		ObjectMapper mapper = new ObjectMapper();
		ObjectNode combinedQuery = null;
		try {
			combinedQuery = mapper.readValue(structuredQuery, ObjectNode.class);
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			logger.warn(e.toString());
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			logger.warn(e.toString());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			logger.warn(e.toString());
		}
		ObjectNode combinedSearchObject = (ObjectNode) combinedQuery
				.get("search");
		ObjectNode combinedQueryObject = (ObjectNode) combinedQuery
				.get("query");
		if (combinedSearchObject == null && combinedQueryObject == null) {
			combinedQueryObject = mapper.createObjectNode();
			combinedQuery.put("query", combinedQueryObject);
		} else if (combinedSearchObject != null
				&& combinedSearchObject.get("qtext") == null) {
			combinedSearchObject.put("qtext", qtext);
		}
		JsonNode postedStartNode = combinedQueryObject.get("start");
		if (postedStartNode != null) {
			start = postedStartNode.asLong();
			combinedQueryObject.remove("start");
		}
		return docService.rawSearch(ClientRole.securityContextRole(),
				combinedQuery, options, start, pageLength);
	}

	/**
	 * Exposes an endpoint for search suggestions.
	 * 
	 * @param combinedQuery
	 *            A JSON combined query.
	 * @param start
	 *            The index of the first result to return.
	 * @return A Search Results JSON response.
	 */
	@RequestMapping(value = "v1/suggest", method = RequestMethod.GET)
	public @ResponseBody ObjectNode getSearchSuggest(
			@RequestParam(defaultValue = "", required = false) String qtext,
			@RequestParam(defaultValue = "all", required = false) String options) {
		return docService.suggest(qtext, options);
	}

	/**
	 * Exposes an endpoint for search suggestions.
	 * 
	 * @param combinedQuery
	 *            A JSON combined query.
	 * @param start
	 *            The index of the first result to return.
	 * @return A Search Results JSON response.
	 */
	@RequestMapping(value = "v1/suggest", method = RequestMethod.POST)
	public @ResponseBody ObjectNode postSearchSuggest(
			@RequestParam(defaultValue = "", required = false) String qtext,
			@RequestParam(defaultValue = "all", required = false) String options) {
		return docService.suggest(qtext, options);
	}

	/**
	 * Exposes an endpoint for search options.
	 * 
	 * @param combinedQuery
	 *            A JSON combined query.
	 * @param start
	 *            The index of the first result to return.
	 * @return A Search Results JSON response.
	 */
	@RequestMapping(value = "v1/config/query/{options}", method = RequestMethod.GET)
	public @ResponseBody JsonNode getSearchOptions(
			@PathVariable("options") String options) {
		return docService.rawOptions(null, options);
	}

	/**
	 * Exposes an endpoint for search cooccurence.
	 * 
	 * @param combinedQuery
	 *            A JSON combined query.
	 * @param constraint
	 *            The name of the values to return.
	 * @return A Search Results JSON response.
	 */
	@RequestMapping(value = "v1/values/{constraint}", method = RequestMethod.POST)
	public @ResponseBody JsonNode getCooccurrence(
			@RequestBody ObjectNode structuredQuery,
			@PathVariable("constraint") String constraint) {
		return docService.rawCoocurrence(null, structuredQuery, constraint);
	}

	/**
	 * Exposes an endpoint for deleting loaded collections.
	 * 
	 * @param start
	 *            The index of the first result to return.
	 */
	@RequestMapping(value = "server/database/collection/{collection}", method = RequestMethod.DELETE)
	public void deleteCollection(@PathVariable("collection") String collection) {
		docService.deleteLoadedCollection(collection);
	}

}
