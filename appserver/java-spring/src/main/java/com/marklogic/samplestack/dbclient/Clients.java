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

import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.samplestack.security.ClientRole;

/**
 * A HashMap of database client connections, with a ClientRole as key. Enables a
 * pool of clients for use by different security access levels.
 */
@SuppressWarnings("serial")
public class Clients extends HashMap<ClientRole, DatabaseClient> {

	/**
	 * Provided by Spring at startup, for accessing environment-specific
	 * variables.
	 */
	private Environment env;
	private String database = "Documents";
	private final Logger logger = LoggerFactory.getLogger(Clients.class);

	Clients(Environment env) {
		super();
		this.env = env;
		DatabaseClient adminClient = databaseClient(
				ClientRole.SAMPLESTACK_ADMIN, "Documents");
		put(ClientRole.SAMPLESTACK_ADMIN, adminClient);
	}

	/**
	 * Sets the database to the contributor and guest database clients
	 */

	public void setDatabase(String database) {
		this.database = database;
		DatabaseClient writerClient = databaseClient(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, this.database);
		DatabaseClient guestClient = databaseClient(
				ClientRole.SAMPLESTACK_GUEST, this.database);
		put(ClientRole.SAMPLESTACK_CONTRIBUTOR, writerClient);
		put(ClientRole.SAMPLESTACK_GUEST, guestClient);
	}

	/**
	 * Gets the database name of the contributor and guest database clients
	 */
	public String getDatabase() {
		return this.database;
	}

	/**
	 * Constructs a Java Client API database Client, of which this application
	 * uses two long-lived instances.
	 * 
	 * @param role
	 *            The security role for whom whom to construct a connection
	 * @return A DatabaseClient for accessing MarkLogic
	 */
	private DatabaseClient databaseClient(ClientRole role, String database) {
		String host = env.getProperty("marklogic.rest.host");
		Integer port = Integer.parseInt(env.getProperty("marklogic.rest.port"));
		String username = env.getProperty(role.getUserParam());
		String password = env.getProperty(role.getPasswordParam());
		return DatabaseClientFactory.newClient(host, port, database, username,
				password, Authentication.DIGEST);
	}

}
