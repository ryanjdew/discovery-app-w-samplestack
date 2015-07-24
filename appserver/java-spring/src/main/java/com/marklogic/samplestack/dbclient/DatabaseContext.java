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
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.pojo.PojoRepository;
import com.marklogic.samplestack.MarkLogicUtilities;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.security.ClientRole;

/**
 * Contains the IoC wiring for the part of Samplestack that interacts with
 * MarkLogic.
 */
@Component
@ComponentScan
@PropertySource("classpath:gradle.properties")
public class DatabaseContext {

	@Autowired
	/** Spring provides this object at startup, for access to environment configuration
	 */
	private Environment env;
	private final Logger logger = LoggerFactory
			.getLogger(DatabaseContext.class);

	@Bean
	/**
	 * Makes a HashMap of Client objects available to the application.
	 * @return A Clients class, which extends HashMap<ClientRole, DatabaseClient>;
	 */
	public Clients clients() {
		Clients clients = new Clients(env);
		String database = "Documents";
		DatabaseClient adminClient = clients.get(ClientRole.SAMPLESTACK_ADMIN);
		JSONDocumentManager docMgr = adminClient.newJSONDocumentManager();
		try {
			// See if there is a database set in configuration
			JacksonHandle responseHandle = new JacksonHandle();
			docMgr.read("/discovery-app/config/server_config.json",
					responseHandle);
			JsonNode serverConfig = responseHandle.get();
			database = serverConfig.get("server-config").get("database")
					.asText("Documents");
		} catch (ResourceNotFoundException e) {
		}
		clients.setDatabase(database);
		return clients;
	}

	@Bean
	/**
	 * Makes a ManagementClient object available to the application.
	 * @return A ManagementClient class, which allows use to modify database properties;
	 */
	public ManagementClient managementClient() {
		ManagementClient mgClient = new ManagementClient(env);
		return mgClient;
	}

	@Bean
	/**
	 * This repository object manages operations for the Contributor POJO Class.
	 * Generally accessed through calls to the ContributorService, which 
	 * mediates and limits some of the access.
	 * @return A PojoRepository object to manage Contributors.
	 */
	public PojoRepository<Contributor, String> repository() {
		return clients().get(ClientRole.SAMPLESTACK_CONTRIBUTOR)
				.newPojoRepository(Contributor.class, String.class);
	}

	@Bean
	/**
	 * Initializes a singleton ObjectMapper.
	 * @return A Jackson ObjectMapper implementation for the Spring IoC container
	 */
	public ObjectMapper mapper() {
		return new CustomObjectMapper();
	}

	@Bean
	/**
	 * Initializes a singleton MarkLogicUtilities.
	 * @return A utilities library
	 */
	public MarkLogicUtilities utilities() {
		return new MarkLogicUtilities(clients());
	}
}
