document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("courseForm");
    const outputDiv = document.getElementById("output");
    const loadButton = document.getElementById("loadConfig");
    const saveButton = document.getElementById("saveConfig");
    const loadingSpinner = document.getElementById("loadingSpinner");
  
    // Array to hold the last 3 log messages
    const logMessages = [];
  
    // Utility function to add a log and keep only the last 3 messages
    function addLog(message, color = "white") {
      // Push the new message
      logMessages.push({ message, color });
      // Keep only the last 3 messages
      if (logMessages.length > 3) {
        logMessages.shift();
      }
      // Update the output div
      outputDiv.innerHTML = logMessages
        .map(log => `<p style="color:${log.color}; margin: 4px 0;">${log.message}</p>`)
        .join("");
    }
  
    console.log("Renderer: Sayfa yüklendi");
  
    // On form submission, send username, password, and CRNs to start the Python process.
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const crnInput = document.getElementById("crns").value;
      const crns = crnInput.split(",").map(crn => crn.trim()).filter(crn => crn !== "");
      console.log("Renderer: Form gönderiliyor", { username, password, crns });
      window.electronAPI.startCRN({ username, password, crns });
    });
  
    // When "Load Config" is clicked, log the event and send the IPC message.
    loadButton.addEventListener("click", () => {
      console.log("Renderer: Ayarları Yükle butonuna tıklandı");
      loadingSpinner.style.display = "inline-block";
      window.electronAPI.loadConfig();
    });
  
    // When "Save Config" is clicked, collect the input values and send them to the main process.
    saveButton.addEventListener("click", () => {
      console.log("Renderer: Ayarları Kaydet butonuna tıklandı");
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const crnInput = document.getElementById("crns").value;
      const crns = crnInput.split(",").map(crn => crn.trim()).filter(crn => crn !== "");
      const configData = {
        login: { username, password },
        crns: crns.map(Number) // Convert CRNs to numbers
      };
      window.electronAPI.saveConfig(configData);
    });
  
    // When config loads successfully, update the fields and hide the spinner.
    window.electronAPI.onLoadConfigSuccess((data) => {
      console.log("Renderer: Ayarlar alındı:", data);
      loadingSpinner.style.display = "none";
      try {
        const config = JSON.parse(data);
        document.getElementById("username").value = config.login.username;
        document.getElementById("password").value = config.login.password;
        document.getElementById("crns").value = config.crns.join(",");
        addLog("Ayarlar başarıyla yüklendi.", "black");
      } catch (e) {
        addLog(`Ayarlar okunurken hata oluştu: ${e}`, "red");
      }
    });
  
    window.electronAPI.onLoadConfigError((error) => {
      console.error("Renderer: Ayarlar yüklenirken hata:", error);
      loadingSpinner.style.display = "none";
      addLog(`Ayarlar yüklenirken hata: ${error}`, "red");
    });
  
    // When config is saved successfully.
    window.electronAPI.onSaveConfigSuccess((message) => {
      console.log("Renderer: Ayarlar başarıyla kaydedildi:", message);
      addLog("Ayarlar başarıyla kaydedildi.", "lightgreen");
    });
  
    window.electronAPI.onSaveConfigError((error) => {
      console.error("Renderer: Ayarlar kaydedilirken hata:", error);
      addLog(`Ayarlar kaydedilirken hata: ${error}`, "red");
    });
  
    // Other IPC listeners for Python output, errors, etc.
    window.electronAPI.onCRNOutput((data) => {
      addLog(`Çıktı: ${data}`, "lightgreen");
    });
    window.electronAPI.onCRNError((data) => {
      addLog(`Hata: ${data}`, "red");
    });
    window.electronAPI.onCRNClose((code) => {
      addLog(`İşlem sonlandı. Çıkış kodu: ${code}`, "yellow");
    });
  });
