xquery version "1.0-ml";

module namespace ext = "http://marklogic.com/rest-api/resource/fields";

import module namespace database-model="http://marklogic.com/appservices/infostudio/models/database" at "/ext/database-model.xqy";
import module namespace amped-common = "http://marklogic.com/appservices/util-amped" at "/MarkLogic/appservices/utils/common-amped.xqy";
import module namespace utilities = "http://marklogic.com/utilities" at "/ext/utilities.xqy";

declare namespace roxy = "http://marklogic.com/roxy";
declare namespace jbasic = "http://marklogic.com/xdmp/json/basic";
(:
 : To add parameters to the functions, specify them in the params annotations.
 : Example
 :   declare %roxy:params("uri=xs:string", "priority=xs:int") ext:get(...)
 : This means that the get function will take two parameters, a string and an int.
 :)

(:
 :)
declare
%roxy:params("mode=xs:string")
function ext:get(
  $context as map:map,
  $params  as map:map
) as document-node()*
{
  xdmp:set-response-code(200, "OK"),
  let $mode := map:get($params, 'mode')
  let $dbid := database-model:current-database-id()
  let $test := if(fn:empty($dbid)) then fn:error((),"Must specify a datbase id (dbid)") else ()
  let $fields := database-model:get-fields($dbid)
  return
    document {
      if($mode = "json")
      then (
        map:put($context, "output-types", "application/json"),
        utilities:transform-to-json($fields)
      ) else (
        map:put($context, "output-types", "application/xml"),
        $fields
      )
    }
};

(:
 :)
declare
function ext:post(
    $context as map:map,
    $params  as map:map,
    $input   as document-node()*
) as document-node()?
{
  xdmp:set-response-code(200, "OK"),
  let $dbid := database-model:current-database-id()
  let $test := if(fn:empty($dbid)) then fn:error("Must specify a datbase id (dbid)") else ()
  let $converted-to-xml :=
    if ($input instance of document-node(object-node())) then
      utilities:transform-from-json($input/object-node())
    else
      $input/element()
  let $save := database-model:save-fields($dbid, $converted-to-xml)
  return
    document {
      if($input instance of document-node(object-node()))
      then (
        map:put($context, "output-types", "application/json")
      ) else (
        map:put($context, "output-types", "application/xml")
      ),
      $input/node()
    }
};
