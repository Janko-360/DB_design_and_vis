
/* 
  This app is a combination of 3 sources. 
  1. The foundation of this app comes from the D3 server side demo by gregjopa at: https://github.com/gregjopa/d3-server-side-demo
        from it, the D3 code (in the helpers) and the base of the html pages were used.
  2. The sample webapp provided for us 
        from it, the MySQL connection and the templateRenderer function were used
  3. My own work
        I coded and modified other code to make the D3 app work with a MySQL connection and added all the templates
  
  Other sources are indicated with comments 
  Structure of referencing to other sources: At the start of a block of code, function, loop or any related lines of code, the source is indicated and how much I changed. 
  This reference then counts until the next logical code starts (eg: function, condition, loop, execution) or until the next source is indicated
  
  NB this app does NOT RUN on the LATEST VERSIONS of any dependency, but the versions are the same as the D3 demo. Other versions did not function.
*/

// Provided for the midterm
const express = require('express');
const mysql = require('mysql');
const bodyParser = require("body-parser");
const app = express();

const db = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "sqlrun",
	database: "usa_automation" 
});

db.connect((err) => {
	if(err) {
        console.log("Error connecting")
		throw err;
	}
	console.log("Connected to database");
});

app.engine('.html', require('ejs').__express);
app.set('views', './templates');
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({extended: true}));

// From the D3 demo
app.locals.barChartHelper = require('./helpers/bar_chart_helper');

// Provided for the midterm
function templateRenderer(template, response){
	return function(error, results, fields){
		if(error){
			throw error;
		}
		// console.log(results)
		response.render(template, { data: results });
	}
}

// Home page with the links to all other pages
app.get('/', function(req, res) {
  res.render('index', {});
});

//// The pages with the graphs ////
// I changed the logic for all routs
app.get('/jobs_affected', function(req, res) {
	let jobs_affected_query = `SELECT automation_data.states as label, sum(round(automation_data.jobs*soc.probability)) as data
	                              FROM automation_data 
                                LEFT JOIN SOC
	                              ON automation_data.SOC = soc.code
                                GROUP BY automation_data.states
                                ORDER BY data DESC;`

  db.query(jobs_affected_query, templateRenderer('jobs_affected', res));
});

app.get('/gdp_pc_affected', function(req, res) {
	let gdp_pc_affected_query = `SELECT states_jobs.states as label, states_jobs.jobs_lost*gdp_ps_all_naics.total_gdp as data 
                              FROM (
                              SELECT jobs_lost.states, jobs_lost.jobs_lost, states.code 
                                  FROM (   -- sub selects from https://stackoverflow.com/a/1888845
                                  SELECT automation_data.states, sum(round(automation_data.jobs*soc.probability)) as jobs_lost 
                                    FROM automation_data 
                                    LEFT JOIN SOC 
                                    ON automation_data.SOC = soc.code
                                    GROUP BY automation_data.states
                                  ) as jobs_lost
                                  JOIN states
                                    ON jobs_lost.states = states.GeoName
                                  ) as states_jobs
                              JOIN gdp_ps_all_naics
                                ON gdp_ps_all_naics.geo_ifps = states_jobs.code
                              ORDER BY data DESC
                            ;`
  db.query(gdp_pc_affected_query, templateRenderer('gdp_pc_affected', res));
});

app.get('/salaries_affected', function(req, res) {
	let salaries_affected_query = `SELECT jobs_sector.description as label, data_by_industry.annual_pay*jobs_sector.jobs_lost as data 
                              FROM (
                                SELECT soc_description.jobs_lost, soc_description.description, soc_to_naics.sector FROM (
                                  SELECT soc.code, jobs_affected.jobs_lost, soc.description FROM (
                                    SELECT automation_data.soc, sum(round(automation_data.jobs*soc.probability)) as jobs_lost 
                                      FROM automation_data 
                                      LEFT JOIN SOC 
                                      ON automation_data.SOC = soc.code
                                      GROUP BY automation_data.soc
                                    ) as jobs_affected
                                    JOIN soc
                                      ON jobs_affected.soc = soc.code
                                  ) as soc_description
                                  LEFT JOIN soc_to_naics
                                    ON soc_to_naics.soc_name = soc_description.description
                                ) as jobs_sector
                                  JOIN data_by_industry
                                  ON data_by_industry.naics_code = jobs_sector.sector
                                  LIMIT 20
                              ;`
  db.query(salaries_affected_query, templateRenderer('salaries_affected', res));
});

// Post response for the SELECTion of the type of filtering  
app.post('/salaries_affected', function(req, res) {
  let salaries_affected_query = `SELECT jobs_sector.description as label, data_by_industry.annual_pay*jobs_sector.jobs_lost as data 
              FROM (
                SELECT soc_description.jobs_lost, soc_description.description, soc_to_naics.sector FROM (
                  SELECT soc.code, jobs_affected.jobs_lost, soc.description FROM (
                    SELECT automation_data.soc, sum(round(automation_data.jobs*soc.probability)) as jobs_lost 
                      FROM automation_data 
                      LEFT JOIN SOC 
                      ON automation_data.SOC = soc.code
                      GROUP BY automation_data.soc
                    ) as jobs_affected
                    JOIN soc
                      ON jobs_affected.soc = soc.code
                  ) as soc_description
                  LEFT JOIN soc_to_naics
                    ON soc_to_naics.soc_name = soc_description.description
                ) as jobs_sector
                  JOIN data_by_industry
                  ON data_by_industry.naics_code = jobs_sector.sector`

  if (req.body.sort_by == 'max') {
    salaries_affected_query += `
          ORDER BY data DESC
          LIMIT 20;` 
  } else if (req.body.sort_by == 'min') {  // add sorting and limiting for the smallest values that are not 0
    salaries_affected_query += `
          HAVING data != 0
          ORDER BY data ASC
          LIMIT 20;`
  } else {
    console.log("error selecting sort ON salary data '/salaries_affected'")
  }
  db.query(salaries_affected_query, templateRenderer('salaries_affected', res));
});

app.get('/gdp_ps_pi', function(req, res) {
	let gdp_ps_pi_query = `SELECT jobs_n_industies.industry_name as label, sum(jobs_n_industies.jobs_lost*state_industry_gdps.gdp) as data  FROM (
                          SELECT jobs_n_sectors.jobs_lost, jobs_n_sectors.description as job_name, jobs_n_sectors.states, naics.industry_id, naics.description as industry_name FROM ( -- all SOCs for all states with labled to what industry_id  (NO 1 & 2 id) 
                            SELECT jobs_affected.jobs_lost, jobs_affected.description, jobs_affected.states, soc_to_naics.sector FROM (
                              SELECT automation_data.soc, round(automation_data.jobs*soc.probability) as jobs_lost, soc.description, automation_data.states
                                      FROM automation_data 
                                      LEFT JOIN SOC 
                                      ON automation_data.SOC = soc.code
                              ) as jobs_affected
                              JOIN soc_to_naics
                                ON soc_to_naics.soc_name = jobs_affected.description
                            ) as jobs_n_sectors
                            JOIN naics
                              ON naics.code = jobs_n_sectors.sector
                            ORDER BY industry_id asc
                          ) as jobs_n_industies 
                            JOIN state_industry_gdps
                            ON state_industry_gdps.states = jobs_n_industies.states
                                and state_industry_gdps.industry_id = jobs_n_industies.industry_id
                          GROUP BY jobs_n_industies.states, jobs_n_industies.industry_name
                            having states = "Alabama"
                            ORDER BY data DESC
                        ;`
  db.query(gdp_ps_pi_query, templateRenderer('gdp_ps_pi', res));
});

// Post response for the filtering by states 
app.post('/gdp_ps_pi', function(req, res) {
  let gdp_ps_pi_query = `SELECT jobs_n_industies.industry_name as label, sum(jobs_n_industies.jobs_lost*state_industry_gdps.gdp) as data  FROM (
                          SELECT jobs_n_sectors.jobs_lost, jobs_n_sectors.description as job_name, jobs_n_sectors.states, naics.industry_id, naics.description as industry_name FROM ( -- all SOCs for all states with labled to what industry_id  (NO 1 & 2 id) 
                            SELECT jobs_affected.jobs_lost, jobs_affected.description, jobs_affected.states, soc_to_naics.sector FROM (
                              SELECT automation_data.soc, round(automation_data.jobs*soc.probability) as jobs_lost, soc.description, automation_data.states
                                      FROM automation_data 
                                      LEFT JOIN SOC 
                                      ON automation_data.SOC = soc.code
                              ) as jobs_affected
                              JOIN soc_to_naics
                                ON soc_to_naics.soc_name = jobs_affected.description
                            ) as jobs_n_sectors
                            JOIN naics
                              ON naics.code = jobs_n_sectors.sector
                            ORDER BY industry_id asc
                          ) as jobs_n_industies 
                            JOIN state_industry_gdps
                            ON state_industry_gdps.states = jobs_n_industies.states
                                and state_industry_gdps.industry_id = jobs_n_industies.industry_id
                          GROUP BY jobs_n_industies.states, jobs_n_industies.industry_name
                            having states = "${req.body.states}"
                            ORDER BY data DESC
                        ;`
  db.query(gdp_ps_pi_query, templateRenderer('gdp_ps_pi', res));
});

app.listen(8888);  // 8888 is personal preference 
console.log('listening on port 3000'); 