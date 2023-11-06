**RSS Task**
Installation
To install the project, run the following command:
> npm install

Usage
To start the project, use the following command:
> npm start

Endpoints
> GET /rss/:section
Replace :section with the desired section name in kebab-case, for example: business, movies, technology.

Response:
 `<channel>
        <title>
            <![CDATA[football]]>
        </title>
       <description>
           <![CDATA[football]]>
        </description>
        <id>football</id>
        <webTitle>Football</webTitle>
        <webUrl>https://www.theguardian.com/football</webUrl>
        <apiUrl>https://content.guardianapis.com/football</apiUrl>
    </channel>`
