xquery version "1.0-ml";

(: Copyright 2002-2015 MarkLogic Corporation.  All Rights Reserved. :)

module namespace database-model="http://marklogic.com/appservices/infostudio/models/database";

import module namespace amped-common = "http://marklogic.com/appservices/util-amped" at "/MarkLogic/appservices/utils/common-amped.xqy";
import module namespace amped-info = "http://marklogic.com/appservices/infostudio/util-amped" at "/MarkLogic/appservices/infostudio/info-amped.xqy";
declare namespace db="http://marklogic.com/xdmp/database";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare function database-model:current-database-id(
) as xs:unsignedLong?
{
    xdmp:database()
};

declare function database-model:get-range-indexes(
    $dbid as xs:unsignedLong
) as element(rangeindex-list)
{
        <rangeindex-list>
        {
                amped-common:appservices-database-get-range-indexes($dbid)
        }
        </rangeindex-list>
};

declare function database-model:save-range-indexes(
    $dbid as xs:unsignedLong,
    $range-indexes as element(rangeindex-list)
) as empty-sequence()
{
    let $current := database-model:get-range-indexes($dbid)
    let $delta := database-model:range-indexes-delta($current, $range-indexes)
    let $deletes := $delta/delete/*
    let $adds := $delta/add/*
    let $do-delete := amped-info:infostudio-database-delete-range-index($dbid, $deletes)
    let $do-add := amped-info:infostudio-database-add-range-index($dbid, $adds)
    return ()
};

declare function database-model:_list-filter(
    $candidates as element()*,
    $baselines as element()*
) as element()*
{
    for $candidate in $candidates
    let $exists := false()
    let $check :=
        for $baseline in $baselines
        return
            if (deep-equal($candidate, $baseline))
            then xdmp:set($exists, true())
            else ()
    return
        if (not($exists))
        then $candidate
        else ()
};

declare function database-model:range-indexes-delta(
    $current as element(rangeindex-list),
    $new as element(rangeindex-list)
) as element(delta)
{
    <delta>
        <add>{ database-model:_list-filter($new/*[./local-name() = ("range-element-attribute-index", "range-element-index", "range-field-index", "range-path-index")],
                                           $current/*[./local-name() = ("range-element-attribute-index", "range-element-index", "range-field-index", "range-path-index")] ) }</add>
        <delete>{ database-model:_list-filter($current/*[./local-name() = ("range-element-attribute-index", "range-element-index", "range-field-index", "range-path-index")],
                                              $new/*[./local-name() = ("range-element-attribute-index", "range-element-index", "range-field-index", "range-path-index")] ) }</delete>
    </delta>
};

declare function database-model:fields-delta(
    $current as element(field-list),
    $new as element(field-list)
) as element(delta)
{
    <delta>
        <add>{ database-model:_list-filter($new/db:field, $current/db:field) }</add>
        <delete>{ database-model:_list-filter($current/db:field, $new/db:field) }</delete>
    </delta>
};

declare function database-model:get-fields(
    $dbid as xs:unsignedLong
) as element(field-list)
{
        <field-list>
        {
                amped-common:appservices-database-get-fields($dbid)
        }
        </field-list>
};

declare function database-model:save-fields(
    $dbid as xs:unsignedLong,
    $fields as element(field-list)
) as empty-sequence()
{
    let $current := database-model:get-fields($dbid)
    let $delta := database-model:fields-delta($current, $fields)
    let $deletes := $delta/delete/db:field/db:field-name/string()
    let $adds := $delta/add/db:field
    return(
        if($deletes) then
            amped-info:infostudio-database-delete-field($dbid, $deletes)
        else (),

        if($adds) then
            amped-info:infostudio-database-add-field($dbid, $adds)
        else ()
    )
};

