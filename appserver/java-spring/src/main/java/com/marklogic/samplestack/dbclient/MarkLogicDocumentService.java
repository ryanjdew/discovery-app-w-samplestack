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

import static com.marklogic.samplestack.SamplestackConstants.DOCUMENTS_DIRECTORY;
import static com.marklogic.samplestack.SamplestackConstants.DOCUMENTS_OPTIONS;
import static com.marklogic.samplestack.security.ClientRole.SAMPLESTACK_CONTRIBUTOR;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.BytesHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.QueryManager.QueryView;
import com.marklogic.client.query.RawQueryDefinition;
import com.marklogic.samplestack.exception.SamplestackSearchException;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.service.DocumentService;

/**
 * Implementation of the QnAService interface that uses the MarkLogic Java Client API
 * to implement searches and document updates.  In this class you'll find examples
 * of how to use MarkLogic's multistatement transactions, server-side transforms,
 * and modifications to document permissions.
 * 
 * @see <a href="http://docs.marklogic.com/REST/client/transaction-management">REST API /v1/transactions</a>
 * @see <a href="http://docs.marklogic.com/REST/client/transaction-management">REST API /v1/documents</a>
 * @see <a href="http://docs.marklogic.com/REST/client/transaction-management">REST API /v1/search</a>
 * @see <a href="http://docs.marklogic.com/REST/client/transaction-management">REST API /v1/values</a>
 * @see <a href="http://docs.marklogic.com/guide/java/transactions">Java Client API Transactions</a>
 * @see <a href="http://docs.marklogic.com/guide/java/document-operations/">Java Client API Document operations</a>
 * @see <a href="http://docs.marklogic.com/guide/java/searches">Java Client API Searches</a>
 */
@Component
public class MarkLogicDocumentService extends MarkLogicBaseService implements
		DocumentService {

	@Autowired
	private ContributorService contributorService;

	private final Logger logger = LoggerFactory
			.getLogger(MarkLogicDocumentService.class);

	/**
	 * This method simply runs a search against MarkLogic so that its
	 * cache warms up while the Java tier is also warming up.
	 * @throws Exception
	 */
	@PostConstruct
	public void warmupSearchCache() throws Exception {
		logger.info("Warming up MarkLogic Search Caches");
		ObjectNode query = (ObjectNode) mapper
				.readValue("{\"search\":{\"qtext\":\"\"}}",
						JsonNode.class);
		this.rawSearch(SAMPLESTACK_CONTRIBUTOR, query, "all", 1, 1);
	}
	
	@Override
	public JsonNode rawSearch(ClientRole role, ObjectNode structuredQuery, String options,
			long start, long pageLength) {
		ObjectNode docNode = mapper.createObjectNode();
		if (structuredQuery != null) {
			if (structuredQuery.get("query") != null) {
				ObjectNode queryNode = docNode.putObject("query");
				queryNode.setAll((ObjectNode) structuredQuery.get("query"));
			} else if (structuredQuery.get("search") != null) {
				ObjectNode searchNode = docNode.putObject("search");
				searchNode.setAll((ObjectNode) structuredQuery.get("search"));
			}
		}
		QueryManager queryManager = clients.get(role).newQueryManager();
		queryManager.setView(QueryView.ALL);
		GenericDocumentManager docMgr = genericDocumentManager(role);

		RawQueryDefinition qdef = queryManager.newRawStructuredQueryDefinition(
				new JacksonHandle(docNode), DOCUMENTS_OPTIONS);;
		qdef.setDirectory(DOCUMENTS_DIRECTORY);
		qdef.setOptionsName(options);
		JacksonHandle responseHandle = new JacksonHandle();
		docMgr.setSearchView(QueryView.ALL);
		docMgr.setPageLength(pageLength);

		try {
			docMgr.search(qdef, start, responseHandle);
		} catch (com.marklogic.client.FailedRequestException ex) {
			throw new SamplestackSearchException(ex);
		}
		return responseHandle.get();
	}

	@Override
	public byte[] get(String uri, ServerTransform transform) {
		GenericDocumentManager docMgr = genericDocumentManager(SAMPLESTACK_CONTRIBUTOR);
		BytesHandle responseHandle = new BytesHandle();
		docMgr.read(uri, null, responseHandle, transform);
		return responseHandle.get();
	}

	@Override
	public void delete(String uri) {
		genericDocumentManager(SAMPLESTACK_CONTRIBUTOR).delete(uri);
	}

	@Override
	public void deleteAll() {
		deleteDirectory(SAMPLESTACK_CONTRIBUTOR, DOCUMENTS_DIRECTORY);
	}

}
