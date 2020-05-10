# Capstone

### Dependencies
* [algebra.js](https://algebra.js.org/)
* [mathjs](https://mathjs.org/)

```html
npm install algebra.js 
npm install mathjs 
npm run test_${milestone_number} (e.g. npm run test_m1)
```

Note: All dependencies are included in the package.json file and so running ```npm install``` 
should download all dependencies at once

### Getting Started
#### Cloning the repository:
```
git clone --recursive https://github.com/capstone2019-2020/Capstone.git
```
IMPORTANT: must include the '--recursive' flag in order to pull the submodule dependencies

#### Updating submodules:
```
git submodule update --init --recursive --remote
```
* Run this command if any changes have been made to the remote submodule repos
