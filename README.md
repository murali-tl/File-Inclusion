# File-Inclusion

-  Given a file source.js, you need to get the content of the file and write it in dest.txt file. 
 

-  You need to iterate the file and check if there are any imports and get the content of the import file and add it to the destination file 
 
## Example: 

`source.js `
```js
import './file1.js' 

 

function sum(a,b) { 

return a+b; 

} 
```
 

`file1.js` 

 ```js
import './file2.js' 

 

function diff(a,b) { 

return a-b; 

} 
```
 
`file2.js `

 ```
function multiply(a,b) { 

return a*b; 

} 
```
 

## Output: 

 
`dest.txt ` 
```
function multiply(a,b) { 

return a*b; 

} 

 

function diff(a,b) {  

return a-b;  

} 

 

function sum(a,b) {  

return a+b;  

}
```
