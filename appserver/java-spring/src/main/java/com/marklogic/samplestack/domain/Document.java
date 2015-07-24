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
package com.marklogic.samplestack.domain;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * Class that wraps a JSON document and its ID. The main payload for operations
 * on questions and answers.
 *
 */
public class Document {

	protected ObjectNode json;

	public String getId() {
		return json.get("id").asText();
	}

	public void setId(String id) {
		json.put("id", id);
	}

	public JsonNode getJson() {
		return json;
	}

	/**
	 * Constructor to make a QnADocument from an in-hand JSON node.
	 * 
	 * @param jsonObject
	 *            A JSON node that contains a question and answer document.
	 */
	public Document(ObjectNode jsonObject) {
		this.json = jsonObject;
	}

}
