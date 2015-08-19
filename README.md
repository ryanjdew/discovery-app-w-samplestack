# Discovery App from Marklogic SampleStack

This application is derived from the [MarkLogic SampleStack](https://github.com/marklogic/marklogic-samplestack) and is implemented using Java, Spring, and Gradle.

The project includes the following major components:
* MVC browser application implemented in [Angular.js](https://angularjs.org)
* Middle appserver tier implemented in Java/[Spring](http://projects.spring.io/spring-framework/)
* [MarkLogic](http://www.marklogic.com/) for the database tier
* [Gradle](http://www.gradle.org/) framework to drive build and configuration of the appserver and database tiers
* Unit and end-to-end tests

This README covers the following topics:
* [Getting Started](#getting-started)
* [Additional Information](#additional-information)
* [License](#license)

## Getting Started

To start, clone this repository. For example, run the following command:  

```
git clone https://github.com/ryanjdew/discovery-app-w-samplestack
```

Ensure the [gradle.properties](appserver/java-spring/gradle.properties) configuration matches what you desire. You'll need to be sure that 'marklogic.admin.user' and 'marklogic.admin.password' match a MarkLogic user that has the admin role. The default ports to run on are 8006 (MarkLogic) and 8090 (Java Spring). These can also be adjusted appropriately in the gradle.properties.

```
cd discovery-app-w-samplestack
sh startup.sh
```

This will configure your MarkLogic install as necessary and then start a Java Spring application server. It will stop prior to hitting 100%, but you should see a message about a Tomcat instance starting.

From here, you can open your browser to http://localhost:8090/. Login with the credentials admin/admin (Note: This is a user setup provided with an included [ldif file](appserver/java-spring/src/main/resources/samplestack-ds.ldif), not a MarkLogic user.). Once you're logged the setup link in the top right corner will be available to take you to the Setup section where your application can be configured.

## Additional Information
For more information, see the following:
* READMEs for the [database](database/README.md), [Java appserver](appserver/java-spring/README.md), and [Angular.js browser](browser/README.md) tiers.
* [Samplestack wiki](https://github.com/marklogic/marklogic-samplestack/wiki).
* [MarkLogic product documentation](http://docs.marklogic.com) for further details on MarkLogic Server and the Client APIs.
* MarkLogic [Developer Community](http://developer.marklogic.com/) site with tutorials, blogs, and more.
* Full [Documentation](http://docs.marklogic.com/guide/ref-arch) on the Reference Architecture and Samplestack.
* Take [Free MarkLogic Training](http://www.marklogic.com/services/training).
Some of the courses cover how to build Samplestack.

## License

Copyright © 2012-2015 MarkLogic

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
