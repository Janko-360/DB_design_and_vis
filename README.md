# DB_design_and_vis

The goal of this project was to answer a question that is complex enough to need more than one data source to sufficiently solve it. Two data sources were consulted to create a database. That database would then be queried for information **to determine the potential effect of automation on various aspects of the economy of the USA**. 

**PLEASE note**, this is just a academic project and not an accurate prediction or account of what happened. Only what could happen based on the probabilistic estimation from this [report](http://www.oxfordmartin.ox.ac.uk/downloads/academic/The_Future_of_Employment.pdf).  

<br>

## Methodology 
1. Formulate research question
2. Find open datasets to use
    1. The primary data set was the *Occupations by State and Likelihood of Automation* dataset from [data.world](https://data.world/wnedds/occupations-by-state-and-likelihood-of-automation)
    2. Then a few datasets from the USA regarding it's economy and occupations per industry (more details in the report)
4. Design and create the database
    1. Clean the data in excel
    2. Create junction tables to link all datasets
    3. Design tables and normalize the database. (Only reached 3NF)
    4. Build the database in MySQL
5. Create visualisations in a webapp
    1. Build a node.js webapp
    2. Query the information from the local database (All SQL commands are listed in the report) 
    3. Build graphs with D3.js
  
<br>

## A few screenshots
### Database schema
![Image](/Images/Schema.png)
### Some of the best graphs
### Sum affected GDP per industry filtered by state 
![Image](/Images/GDP_pi_ps.png)
### Number of affected jobs
![Image](/Images/Job_count.png)
### Sum of affected salaries per industry 
![Image](/Images/Salaries_high_first.png)

<br>

## Usage of this project 
- Go for it, have fun. Use it how ever you want and if you can learn something new, that would be great.  
- **BUT** don't copy this project for any academic work. My project is in the system first.  
- Only use this to make meningful decisions when the SOC jobs to NAICS industries junction table has been finetuned. It was a fast job and is inacurate.  

<br>

## Tech used 
- MySQL
- node.js
- D3.js
- and some more for the webapp

## How to run it
1. Recreate the database with the SQL dump file. 
2. Get node.js running on your machine
   1. npm init         (in the right directory)
   3. npm install      (package.json is inluded)
   4. npm start        (and it should start a new website with naviagtion to all the graphs)
  
<br>


## For more detailed info about this project and its references. Please view the report.  

<br>
<br><br><br><br><br>  
    
