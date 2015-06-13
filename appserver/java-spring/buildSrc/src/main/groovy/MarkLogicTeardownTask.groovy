import groovy.json.*
import groovyx.net.http.RESTClient
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

public class MarkLogicTeardownTask extends MarkLogicTask {

    @TaskAction
    void teardown() {
        teardownRest();
        delay();
        removeUsers();
    }

    void teardownRest() {
		RESTClient client = bootstrapClient();
		def params = [:]
        params.queryString = "include=modules"
        try {
            client.delete(params)
        } catch (ex) {
          if (ex.response) 
          {
             logger.error(": " + ex.response.data.text) 
          }
          else 
          {
             logger.warn("No response from server") 
          }
          throw new RuntimeException("Failed Teardown.  Check environment before proceeding.", ex)
        }
    }

    void removeUsers() {
        def url = "http://" + config.marklogic.rest.host + ":8002/manage/v2/"
        RESTClient client = new RESTClient(url + "users/discovery-app-admin")
        def params = [:]
        client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
        client.delete(params)
        client = new RESTClient(url + "users/discovery-app-guest")
        client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
        client.delete(params)
        client = new RESTClient(url + "users/discovery-app-contributor")
        client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
        client.delete(params)
        client = new RESTClient(url + "roles/discovery-app-guest")
        client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
        client.delete(params)
        client = new RESTClient(url + "roles/discovery-app-writer")
        client.auth.basic config.marklogic.admin.user, config.marklogic.admin.password
        client.delete(params)
    }

}
