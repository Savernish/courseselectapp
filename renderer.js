document.addEventListener("DOMContentLoaded", () => {
    // Gerekli DOM elementlerini al
    const form = document.getElementById("courseForm");
    const outputDiv = document.getElementById("output");
    const loadButton = document.getElementById("loadConfig");
    const saveButton = document.getElementById("saveConfig");
    const loadingSpinner = document.getElementById("loadingSpinner");
  
    // Son 3 log mesajını tutacak dizi
    const logMessages = [];
  
    // Log ekleme ve son 3 mesajı tutma işlevi
    function addLog(message, color = "white") {
      // Yeni mesajı ekle
      logMessages.push({ message, color });
      // Sadece son 3 mesajı tut
      if (logMessages.length > 3) {
        logMessages.shift();
      }
      // Çıktı alanını güncelle
      outputDiv.innerHTML = logMessages
        .map(log => `<p style="color:${log.color}; margin: 4px 0;">${log.message}</p>`)
        .join("");
    }
  
    console.log("Renderer: Sayfa yuklendi");
  
    // Form gönderildiğinde, kullanıcı adı, şifre ve CRN'leri alarak Python sürecini başlat.
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const crnInput = document.getElementById("crns").value;
      const crns = crnInput.split(",").map(crn => crn.trim()).filter(crn => crn !== "");
      
      const targetTime = {
        year: document.getElementById("targetDate").value.split("/")[0],
        month: document.getElementById("targetDate").value.split("/")[1],
        day: document.getElementById("targetDate").value.split("/")[2],
        hour: document.getElementById("targetHour").value,
        minute: document.getElementById("targetMinute").value,
        second: document.getElementById("targetSecond").value
      };

      console.log("Renderer: Form gonderiliyor", { username, password, crns, targetTime });
      window.electronAPI.startCRN({ username, password, crns, targetTime });
    });

    // Tarih girişi için otomatik biçimlendirme
    const dateInput = document.getElementById("targetDate");
    dateInput.addEventListener("input", function(e) {
        // Sadece rakamları tut
        let value = e.target.value.replace(/\D/g, ""); 
        if (value.length > 8) value = value.slice(0, 8);
        
        // Eğik çizgileri otomatik ekle
        if (value.length >= 4) {
            value = value.slice(0, 4) + "/" + value.slice(4);
        }
        if (value.length >= 7) {
            value = value.slice(0, 7) + "/" + value.slice(7);
        }
        e.target.value = value;
    });
  
    // "Load Config" tıklandığında, olayı logla ve IPC mesajını gönder.
    loadButton.addEventListener("click", () => {
      console.log("Renderer: Ayarlari Yukle butonuna tiklandi");
      loadingSpinner.style.display = "inline-block";
      window.electronAPI.loadConfig();
    });
  
    // "Save Config" tıklandığında, giriş değerlerini topla ve ana sürece gönder.
    saveButton.addEventListener("click", () => {
      console.log("Renderer: Ayarlari Kaydet butonuna tiklandi");
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const crnInput = document.getElementById("crns").value;
      const crns = crnInput.split(",").map(crn => crn.trim()).filter(crn => crn !== "");
      const configData = {
        login: { username, password },
        crns: crns.map(Number), // CRN'leri sayılara dönüştür
        targetTime: {
            date: document.getElementById("targetDate").value,
            hour: document.getElementById("targetHour").value,
            minute: document.getElementById("targetMinute").value,
            second: document.getElementById("targetSecond").value
        }
      };
      window.electronAPI.saveConfig(configData);
    });
  
    // Ayarlar başarıyla yüklendiğinde, alanları güncelle ve spinner'ı gizle.
    window.electronAPI.onLoadConfigSuccess((data) => {
      console.log("Renderer: Ayarlar alindi:", data);
      loadingSpinner.style.display = "none";
      try {
        const config = JSON.parse(data);
        document.getElementById("username").value = config.login.username;
        document.getElementById("password").value = config.login.password;
        document.getElementById("crns").value = config.crns.join(",");
        
        // Zaman ayarlarını yükle
        if (config.targetTime) {
            document.getElementById("targetDate").value = config.targetTime.date || "";
            document.getElementById("targetHour").value = config.targetTime.hour || "";
            document.getElementById("targetMinute").value = config.targetTime.minute || "";
            document.getElementById("targetSecond").value = config.targetTime.second || "";
        }
        
        addLog("Ayarlar başarıyla yüklendi.", "black");
      } catch (e) {
        addLog(`Ayarlar okunurken hata oluştu: ${e}`, "red");
      }
    });
  
    window.electronAPI.onLoadConfigError((error) => {
      console.error("Renderer: Ayarlar yuklenirken hata:", error);
      loadingSpinner.style.display = "none";
      addLog(`Ayarlar yüklenirken hata: ${error}`, "red");
    });
  
    // Ayarlar başarıyla kaydedildiğinde.
    window.electronAPI.onSaveConfigSuccess((message) => {
      console.log("Renderer: Ayarlar basariyla kaydedildi:", message);
      addLog("Ayarlar başarıyla kaydedildi.", "lightgreen");
    });
  
    window.electronAPI.onSaveConfigError((error) => {
      console.error("Renderer: Ayarlar kaydedilirken hata:", error);
      addLog(`Ayarlar kaydedilirken hata: ${error}`, "red");
    });
  
    // Diğer IPC dinleyicileri için Python çıktısı, hatalar vb.
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
