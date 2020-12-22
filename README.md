# Project Description
The objective of this project is to help analog circuit designers analyze feedback characteristics of linear circuits, therefore, gain insights into the circuits' stability. The approach taken to fulfill this objective involves applying DPI (Driving Point Impedance) analysis to the input circuit, generating the SFG (Signal Flow Graph) based on the series of equations resulted from the DPI analysis and visualizing the transfer function and the loop gain in the form of bode magnitude/phase plot.

Visit [here](http://capstone-45-sfg.s3-website-us-east-1.amazonaws.com/) to test out the final version of this application. Note that you will be required to give an input file following the format described [below](https://github.com/capstone2019-2020/Capstone/blob/master/README.md#a-few-words-on-the-input-file-formats).

### Dependencies
* [algebra.js](https://algebra.js.org/)
* [mathjs](https://mathjs.org/)

```html
npm install algebra.js 
npm install mathjs 
npm run test_${milestone_number} (e.g. npm run test_m1)
```

**Note: All dependencies are included in the package.json file and so running ```npm install``` 
should download all dependencies at once**

### Getting Started
#### Cloning the repository:
```
git clone --recursive https://github.com/capstone2019-2020/Capstone.git
```
IMPORTANT: must include the '--recursive' flag in order to pull the submodule dependencies

#### Running the application locally:
1. Once you clone the repository, change directory to src (```cd src```)
2. Make sure all dependencies are installed as specified in [Dependencies](https://github.com/capstone2019-2020/Capstone#dependencies)
3. Run server.js using ```node server.js```
4. If you see ```Application listening on port 80```, it means that the server is running
5. Open buttonindex.html in a browser (*Please note that using Firefox will result in the cleanest bode plots*)
6. Upload your netlist and enjoy!

#### A few Words on the input file formats:
The application supports netlist files with .txt and .asc extensions. Both of these file formats can be easily obtained from any SPICE tool by exporting your circuit schematic. If you would like to have circuit overlay visualization, then you **must provide .asc file** which contains positional information of the schematic.

An example .txt file (only contains circuit wiring info) looks as follows:
```
V1 1 0 24
R1 2 1 4
C1 2 0 0.002
```

The corresponding .asc file (what .txt file has + positional info) looks as follows:
```
; V1 1 0 24
; R1 2 1 4
; C1 2 0 0.002
Version 4
SHEET 1 880 680
WIRE 16 32 -112 32
WIRE 192 32 96 32
WIRE -112 128 -112 32
WIRE 192 128 192 32
WIRE -112 256 -112 208
WIRE 192 256 192 192
WIRE 192 256 -112 256
WIRE -112 304 -112 256
FLAG -112 304 0
SYMBOL voltage -112 112 R0
WINDOW 123 0 0 Left 0
WINDOW 39 0 0 Left 0
SYMATTR InstName V1
SYMATTR Value 24
SYMBOL res 112 16 R90
WINDOW 0 0 56 VBottom 2
WINDOW 3 32 56 VTop 2
SYMATTR InstName R1
SYMATTR Value 4
SYMBOL cap 176 128 R0
SYMATTR InstName C1
SYMATTR Value 0.002
```

Please note that when you are providing .asc, each line of circuit information should have ; at the very beginning as shown in the example!



### Updating submodules:
```
git submodule update --init --recursive --remote
```
* Run this command if any changes have been made to the remote submodule repos
