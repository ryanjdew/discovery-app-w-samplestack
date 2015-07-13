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
package com.marklogic.samplestack.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.samplestack.security.ClientRole;

/**
 * Defines methods for manipulating question-and-answer documents.
 */
public interface DocumentService {

	/**
	 * Send a [JSON] raw structured query to the server, using the options
	 * configured for a QuestionAndAnswer search.
	 * 
	 * @param role
	 *            ClientRole on whose behalf to execute the search.
	 * @param structuredQuery
	 *            A JSON structured query payload, as a JSONNode.
	 * @param start
	 *            Index of the first result in the result set.
	 * @param pageLength 
	 * @return A QuestionResults object containing results/snippets for the
	 *         search.
	 */
	public JsonNode rawSearch(ClientRole role, ObjectNode structuredQuery, 
			String options, long start, long pageLength);

	/**
	 * Retrieves a Document by uri.
	 * 
	 * @param uri  of the document
	 * @param transform of document
	 * @return The Document identified by uri
	 */
	public byte[] get(String uri, ServerTransform transform);

	/**
	 * Suggests text for search
	 * 
	 * @param qtext query text for suggestion
	 * @param options for suggestion
	 */
	public ObjectNode suggest(String qtext, String options);

	/**
	 * Removes a QnA document from the database. Not used by the runtime
	 * application.
	 * 
	 * @param uri
	 *            The uri of the document to delete.
	 */
	public void delete(String uri);

	/**
	 * Removes all the documents from the database. Convenient for testing.
	 */
	public void deleteAll();

	JsonNode rawOptions(ClientRole role, String optionsName);

	JsonNode rawCoocurrence(ClientRole role, ObjectNode structuredQuery,
			String constraint);

	void deleteLoadedCollection(String collection);

}
