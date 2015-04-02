xquery version "1.0-ml";

module namespace ext = "http://marklogic.com/rest-api/resource/load-data";

declare namespace dir = "http://marklogic.com/xdmp/directory";
declare namespace rapi = "http://marklogic.com/rest-api";
declare namespace roxy = "http://marklogic.com/roxy";

(:
 : To add parameters to the functions, specify them in the params annotations.
 : Example
 :   declare %roxy:params("uri=xs:string", "priority=xs:int") ext:get(...)
 : This means that the get function will take two parameters, a string and an int.
 :)

(:
 :)
declare
%rapi:transaction-mode("update")
%roxy:params("directory=xs:string")
function ext:post(
    $context as map:map,
    $params  as map:map,
    $input   as document-node()*
) as document-node()*
{
  map:put($context, "output-types", "application/json"),
  xdmp:set-response-code(200, "OK"),
  let $doc-permissions :=
    (
      xdmp:permission('rest-reader', 'read'),
      xdmp:permission('rest-writer', 'update')
    )
  let $directory := map:get($params, 'directory')
  let $directory-info := xdmp:filesystem-directory($directory)
  for $file in $directory-info/dir:entry[dir:type eq "file"][fn:ends-with(dir:filename, ".xml")]
  return
    xdmp:document-insert(
      "/documents/" || $file/dir:filename,
      document {xdmp:unquote(xdmp:filesystem-file($file/dir:pathname))},
      $doc-permissions
    ),
  document { '{"success": true}' }
};
