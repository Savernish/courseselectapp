# Course Selection Automation

Course Selection Automation is a desktop application designed to simplify and automate the process of selecting courses at Istanbul Technical University. This app automates most of the manual steps involved in course registration, making it easier for students to secure all the courses they need.

## Features

- **Automated Course Selection:** Quickly and efficiently select courses by automating the process.
- **Configuration Management:** Save and load your course selection configurations.
- **User-Friendly Interface:** Simple, modern UI for a seamless user experience.

## Installation

Since the `node_modules` folder is not included in this repository (to keep the repository size small), you'll need to install the dependencies locally. Follow these steps:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Savernish/courseselectapp.git
   cd courseselectapp
   ```

2. **Install Dependencies:**

   Ensure you have [Node.js](https://nodejs.org/) installed on your system. Then run:

   ```bash
   npm install
   ```

   This command will install all necessary packages as listed in the `package.json`.

## Running the Application

To start the application, use the following command:

```bash
npm run start
```

This command launches the Electron application.

## Usage

1. **Enter Credentials:**  
   Input your username and password.

2. **Enter CRNs:**  
   Enter the Course Registration Numbers (CRNs) as a comma-separated list (e.g., `22143,20568,22139`).

3. **Automate Course Selection:**  
   Click the **Start CRN** button to initiate the automation process.

4. **Configuration Management:**  
   Use the **Load Config** and **Save Config** buttons to manage your settings.


## Acknowledgements

This project was developed to help streamline the course selection process for students at Istanbul Technical University.