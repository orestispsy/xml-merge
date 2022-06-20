# XML - Merge [React + Node.js]

In this application I am downloading a master XML file by doing an HTTP request with the Node.js standard modules. 
This master file includes a list of urls with downloadable XML files, which will be requested the same way. 
``` bash
<folder>
<lastupdate>2022-06-20T01:04:01+02:00</lastupdate>
<include>https://www.example.com/example.xml</include>
<include>>https://www.example.com/example2.xml</include>
<include>>https://www.example.com/example3.xml</include>
</folder>
 
 ```
All files (including the master) are downloaded and stored locally using the Node.js file system module.


``` bash
File Example 1 

<folder>
<lastupdate>2022-05-20T02:30:10+03:00</lastupdate>
<classifieds>
<classified>
<unique_id>17841</unique_id>
<title>
<![CDATA[ EXAMPLE 1 ]]>
</title>
</classified>
</classifieds>
</folder>
 
 ```
 

``` bash
File Example 2 
 
<folder>
<lastupdate>2022-05-20T01:33:15+03:00</lastupdate>
<classifieds>
<classified>
<unique_id>17842</unique_id>
<title>
<![CDATA[ EXAMPLE 2 ]]>
</title>
</classified>
</classifieds>
</folder>
 
 ```

All files are transformed in JSON format with the help of NPM Package "xml2json" in order to be edited with Vanilla Javascript.
After shorting them, I collect the needed data and merge them back to a single file which is finally transformed again into XML ("json2xml").

The file is stored and the user gets a final XML url with all retrieved data.


``` bash
Final XML (Merged)

<folder>
<lastupdate>2022-06-20T02:35:10+03:00</lastupdate>
<classifieds>
<classified>
<unique_id>17841</unique_id>
<title>
<![CDATA[ EXAMPLE 1 ]]>
</title>
</classified>
<classified>
<unique_id>17842</unique_id>
<title>
<![CDATA[ EXAMPLE 2 ]]>
</title>
</classified>
</classifieds>
</folder>
 
 ```
 
Temporary stored files are deleted at the end of the procedure.


## Setup
Install the dependencies:

``` bash
 npm install
 
 ```

## Development
Start the development server on http://localhost:3000

``` bash
npm run dev

```


## Production
Build the application for production:

``` bash
npm run build

```