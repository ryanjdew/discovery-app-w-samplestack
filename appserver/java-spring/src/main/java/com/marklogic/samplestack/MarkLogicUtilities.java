package com.marklogic.samplestack;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.admin.QueryOptionsManager;
import com.marklogic.client.admin.ServerConfigurationManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.samplestack.dbclient.Clients;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.web.DocumentController;

@Component
public class MarkLogicUtilities {
	@SuppressWarnings("unused")
	private final Logger logger = LoggerFactory
			.getLogger(DocumentController.class);
	
	private ServerConfigurationManager serverConfig = null;
	
	public MarkLogicUtilities(Clients clients) {
		serverConfig = clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).newServerConfigManager();
	}
	
	/**
	 * Gets server config manager.
	 * @return ServerConfigurationManager.
	 */
	public ServerConfigurationManager getServerConfigurationManager() {
		return serverConfig;
	}
	
	/**
	 * Gets tags from the server that are related to the provided one.
	 * @param name for search options.
	 * @return search options as ObjectNode.
	 */
	public ObjectNode getSearchOptions(String name) {
		QueryOptionsManager optsManager = serverConfig.newQueryOptionsManager();
		JacksonHandle responseHandle = new JacksonHandle();
		optsManager.readOptions(name, responseHandle);
		return (ObjectNode) responseHandle.get();
	}
}
