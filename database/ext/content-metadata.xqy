xquery version "1.0-ml";

(: Copyright 2002-2015 MarkLogic Corporation.  All Rights Reserved. :)

module namespace data="http://marklogic.com/appservices/builder/data";

import module namespace amped-build = "http://marklogic.com/appservices/builder/util-amped" at "/MarkLogic/appservices/appbuilder/util-amped.xqy";
import module namespace amped-common = "http://marklogic.com/appservices/util-amped" at "/MarkLogic/appservices/utils/common-amped.xqy";
import module namespace json = "http://marklogic.com/xdmp/json" at "/MarkLogic/json/json.xqy";

declare namespace db = "http://marklogic.com/xdmp/database";
declare namespace proj="http://marklogic.com/appservices/project";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $range-index-element-name as xs:string := "rangeIndex";
declare variable $geospatial-index-element-name as xs:string := "geospatialIndex";

declare function data:range-indexes(
    $pid as xs:unsignedLong,
    $include-empty as xs:boolean
) as element(rangeIndex)*
{
    if ($include-empty)
    then
        <rangeIndex array="true">
            <type></type>
            <elementNamespace></elementNamespace>
            <element></element>
            <attributeNamespace></attributeNamespace>
            <attribute></attribute>
            <fieldName></fieldName>
        </rangeIndex>
    else (),
      let $dbID := xdmp:database(/project[@id = $pid]/@db-name)
      let $range-indexes := amped-common:appservices-database-get-range-indexes($dbID)
      let $attribute-indexes := $range-indexes/self::*:range-element-attribute-index
      let $field-indexes := $range-indexes/self::*:range-field-index
      let $element-indexes := $range-indexes/self::*:range-element-index
      let $indexes :=
    (
      for $index in $element-indexes
          order by string($index/db:localname)
      return
        <rangeIndex array="true">
          <type>xs:{ string($index/db:scalar-type) }</type>
          <elementNamespace>{ string($index/db:namespace-uri) }</elementNamespace>
          <element>{ string($index/db:localname) }</element>
          { if(string($index/db:collation)) then <collation>{ string($index/db:collation) }</collation> else () }
        </rangeIndex>,

      for $index in $attribute-indexes
      let $index-parts-element := ($index/db:parent-localname, $index/db:parent-namespace-uri)
      let $index-parts-attribute := ($index/db:localname, $index/db:namespace-uri)
      let $index-parts := ($index-parts-element, $index-parts-attribute)
      return
        <rangeIndex array="true">
          <type>xs:{ string($index/db:scalar-type) }</type>
          <elementNamespace>{ string($index/db:parent-namespace-uri) }</elementNamespace>
          <element>{ string($index/db:parent-localname) }</element>
          <attributeNamespace>{ string($index/db:namespace-uri) }</attributeNamespace>
          <attribute>{ string($index/db:localname) }</attribute>
          { if(string($index/db:collation)) then <collation>{ string($index/db:collation) }</collation> else () }
        </rangeIndex>,

      for $index in $field-indexes
      let $index-fields := $index/db:field-name
      return
        <rangeIndex array="true">
          <type>xs:{ string($index/db:scalar-type) }</type>
          <fieldName>{ string($index-fields) }</fieldName>
          { if(string($index/db:collation)) then <collation>{ string($index/db:collation) }</collation> else () }
        </rangeIndex>
    )
      return
        for $index in $indexes
        order by if ($index/attribute) then $index/attribute else $index/element
        return
          $index
};

(:~ data:geospatial-indexes
 :
 :  returns sequence of geospatial indexes for use with appbuilder
 :
 :)
declare function data:geospatial-indexes(
    $pid as xs:unsignedLong,
    $include-empty as xs:boolean
) as element()*
{
    if ($include-empty)
    then
        <geoSpatialIndex array="true">
            <geospatialType></geospatialType>
            <elementNamespace></elementNamespace>
            <element></element>
            <attributeNamespace></attributeNamespace>
            <attribute></attribute>
            <fieldName></fieldName>
        </geoSpatialIndex>
    else (),
      let $dbID :=  xdmp:database(/project[@id = $pid]/@db-name)
      let $geospatial-indexes := amped-common:appservices-database-get-geospatial-indexes($dbID)
      let $indexes :=
        (
          for $index in $geospatial-indexes
          order by string($index/db:localname)
          return
            element geospatialIndex {
              attribute array {'true'},
              $index/@*,
              element geotype {local-name($index)}
              ,
              for $child in $index/*
                return
                  element {replace(local-name($child),'-','')}{$child/text()} (: remove any hyphens from element name as this maybe serialized to json :)
            }
        )
        return
        for $index in $indexes
        order by if ($index/attribute) then $index/attribute else $index/element
        return
          $index
};

(: this function is only valid for element-attribute and element indexes (which use the GPEAC) :)
declare function data:get-localname-details(
    $dbID as xs:unsignedLong,
    $localname as xs:string,
    $type as xs:string
) as element(localname)*
{
    let $collation := "http://marklogic.com/collation//S1"
    let $sampleDocuments := data:get-sample-docs($dbID, 5)
    let $sampleProperties := data:get-sample-properties($dbID, 500, $localname)

    let $elements :=
     if($type = ("element", "element-attribute")) then
        ($sampleDocuments/descendant-or-self::*[starts-with(local-name(), $localname,$collation)],
         $sampleProperties)
          else ()
    let $attributes := if($type = ("element-attribute", "attribute")) then $sampleDocuments/descendant-or-self::*/@*[starts-with(local-name(), $localname,$collation)] else ()
    let $map := map:map()
    let $populate :=
        for $element in $elements
        let $key := concat(namespace-uri($element), " ", local-name($element))
        where empty(map:get($map, $key))
        return map:put($map, $key, <localname array="true">
                <elementNamespace>{ namespace-uri($element) }</elementNamespace>
                <element>{ local-name($element) }</element>
                <path>{xdmp:path($element)}</path>
            </localname>)
    let $populate :=
        for $attribute in $attributes
        let $element := $attribute/..
        let $key := concat(namespace-uri($element), " ", local-name($element), " ", namespace-uri($attribute), " ", local-name($attribute))
        where empty(map:get($map, $key))
        return map:put($map, $key, <localname array="true">
                <elementNamespace>{ namespace-uri($element) }</elementNamespace>
                <element>{ local-name($element) }</element>
                <attributeNamespace>{ namespace-uri($attribute) }</attributeNamespace>
                <attribute>{ local-name($attribute) }</attribute>
                <path>{$attribute}</path>
            </localname>)
    for $key in map:keys($map)
    let $value := map:get($map, $key)
    order by if($value/attribute) then string($value/attribute) else string($value/element) ascending
    return map:get($map, $key)
};

declare function data:get-sample-docs(
    $db as xs:unsignedLong,
    $amount as xs:integer
) as node()*
{
    amped-common:appservices-eval('
            declare variable $amount as xs:integer external;

            (collection()/node())[1 to $amount]
        ', (
            xs:QName("amount"), $amount
        ),
        <options xmlns="xdmp:eval">
            <database>{ $db }</database>
        </options>
    )
};


declare function data:get-sample-properties(
    $db as xs:unsignedLong,
    $amount as xs:integer,
    $localname as xs:string
) as element()*
{
    amped-common:appservices-eval('
            declare variable $amount as xs:integer external;
            declare variable $localname as xs:string external;
            (collection()/node())[1 to $amount]/property::*[starts-with(local-name(), $localname,"http://marklogic.com/collation//S1")]
        ', (
            xs:QName("amount"), $amount,
            xs:QName("localname"), $localname
        ),
        <options xmlns="xdmp:eval">
            <database>{ $db }</database>
        </options>
    )
};

declare function data:field-items(
    $pid as xs:unsignedLong
) as xs:string*
{
    let $dbID := xdmp:database(/project[@id = $pid]/@db-name)
    let $fields := amped-common:appservices-database-get-fields($dbID)
    for $field in $fields[db:field-name ne '']
    return string($field/db:field-name)
};

declare function data:value-searchable-field-items(
    $pid as xs:unsignedLong
) as xs:string*
{
    let $dbID := xdmp:database(/project[@id = $pid]/@db-name)
    let $fields := amped-common:appservices-database-get-fields($dbID)[db:field-value-searches eq true()]
    for $field in $fields[db:field-name ne '']
    return string($field/db:field-name)
};

(:~ build-json-config()
 :
 :  builds configuration object to be used by JSON transformer. We are using a custom
 :  transformer that tells the JSON parser to treat geospatialIndex and rangeIndex element name
 :  as array
 :
 :  returns a map that represents the configuration options that should be used by JSON parser
 :)
declare function data:build-json-config(
) as map:map
{
    let $config := json:config("custom")

    return
         (map:put($config, "array-element-names",($geospatial-index-element-name,  $range-index-element-name)),
          map:put($config, "element-prefix", "search"),
          $config)
};

