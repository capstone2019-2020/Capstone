## INTRODUCTION: 
* Capstone Demos will contain all the graph/UI demos that we are going to display to Khoman for the August 14th meeting
* When the application is running, you will be able to navigate to 'http://localhost:8080' on your computer to see a list of links for the demos that we created
* The implementation assumes that your demo can be accessed through an HTML file 

## INSTRUCTIONS TO ADD DEMO:
1. Create another folder under Capstone Demos containing your code 
    * i.e. cytoscape-demo: Demo for the Cytoscape.js graph library
1. Capstone Demos/server.js: add code to specify the URI for your demo 
    1. Add a line to with the following template: 
    ```javascript
    app.get('/<uri_path>', function(req, res) {
      res.sendfile('<path_to_your_html_entry point>'); 
    });
    ```
    * uri_path: the URI to display your demo, can be any string 
        * i.e. '/cytoscape'
        * When navigating to 'http://localhost:8080/cytoscape', the file specified by the <path_to_your_html_entry point> will be sent/displayed in the browser
    * path_to_your_demo_folder: specify the path to the html file that will display your demo (i.e. cytoscape-demo/index.html)
1. Capstone Demos/index.html: Add a link to the demo you just added
    1. Add a line like the following: 
    ```html
    <a href="/<uri_path>">Title of your chosen library/demo</a>
    ```
     * uri_path: same path that you specified in step 2 
1. If you specified any file paths in any of your files, you will have to update them
    * For example, if you previously had a link to a css file as follows: 
    ```html
    <link rel="stylesheet" type="text/css" href="main.css">
    ```
    * You will have to update to:
    ```html 
    <link rel="stylesheet" type="text/css" href="/cytoscape-demo/main.css">
    ```
    * Replace 'cytoscape-demo' with the name of your demo folder - all file paths specified are relative to the 'Capstone Demos' directory
    So in the first example, it would import the Capstone Demos/main.css file instead of the desired one from my cytoscape folder 
    
1. Done ! Can now follow the steps below on how to start the application
    * You should be able to see a link to the demo you added at http://localhost:8080
    * You should be able to navigate to http://localhost:8080/<your_uri_path_from_step_2> and see your demo          


## HOW TO START APPLICATION
##### Preconditions:
1. Must have  Node.js and the node package manager (```npm```) installed in your computer 
    1. Follow instructions here: https://www.npmjs.com/get-npm

##### Steps:
1. If it is your first time running the application you will have to install the dependencies:
    1. In your terminal, cd into the 'Capstone Demos' directory 
        * ```cd <path_to_your_repo>/Capstone\ Demos/```
    1. run the ```npm install``` command
1. Still in the Capstone Demos directory, run ```nodemon server.js``` on your command line
1. Go to any browser, navigate to http://localhost:8080, you should see a page with links to all the demos that we added

**Note**: Any changes you make to your files should automatically be applied so you don't have to keep restarting the Node server. 
You will just have to refresh your browser window to see the your changes.

If for some reason you don't see your changes - first try to restarting the server (Ctl + C on your terminal then re-run ```nodemon server.js```), if that still doesn't work, might have to do some debugging
