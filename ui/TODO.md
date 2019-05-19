## Find reason behind spurious failures
===
The package generation is initiated only when a POST request is
received. So, the browser has to wait for a response until the package
generation completes. Unfortunately package generation takes variable
amounts of time and is not so quick for several reasons such as:

	- This tool relies on other tools which are hosted on the web.

	- A lot of articles means a lot of time as the articles required
	  to generate the package are fetched directly from Wikipedia
	  which results in network delays.
