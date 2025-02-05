document.addEventListener("DOMContentLoaded", function () {
    const addBarangButton = document.getElementById("addBarang");
    const barangFields = document.getElementById("barangFields");
    const barangForm = document.getElementById("barangForm");
    const outputTableBody = document.querySelector("#outputTable tbody");
    const labaKotorElement = document.getElementById("labaKotor");
    const labaBersihElement = document.getElementById("labaBersih");
  

    function formatRupiah(angka) {
      return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
  
    function parseRupiah(rupiah) {
      return parseFloat(rupiah.replace(/\./g, "").replace(/,/g, ".")) || 0;
    }
  
    async function fetchHargaReferensi(namaBarang) {
      try {
        const responses = await Promise.all([
          fetch(`https://sip.kemendag.go.id/api/harga?barang=${encodeURIComponent(namaBarang)}`),
          fetch(`https://hargapangan.id/api/harga?barang=${encodeURIComponent(namaBarang)}`),
          fetch(`https://sisp.kemendag.go.id/api/harga?barang=${encodeURIComponent(namaBarang)}`),
          fetch(`https://infopangan.jakarta.go.id/api/harga?barang=${encodeURIComponent(namaBarang)}`)
        ]);
  
        const data = await Promise.all(responses.map(res => res.json()));
        const hargaList = data.map(item => item.harga || 0).filter(harga => harga > 0);
  
        if (hargaList.length > 0) {
          const avgHarga = hargaList.reduce((a, b) => a + b, 0) / hargaList.length;
          return avgHarga;
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error fetching harga referensi:", error);
        return null;
      }
    }
  
    addBarangButton.addEventListener("click", function () {
      const newRow = document.createElement("div");
      newRow.classList.add("barang-row", "row", "g-3");
      newRow.innerHTML = `
        <div class="col-4">
          <input type="text" name="namaBarang" class="form-control" placeholder="Nama Barang" required>
        </div>
        <div class="col-4">
          <input type="text" name="jumlahBarang" class="form-control jumlah-barang" placeholder="Jumlah Barang" required>
        </div>
        <div class="col-4">
          <input type="text" name="hargaSatuan" class="form-control harga-satuan" placeholder="Harga Satuan (Rp)" required>
        </div>
        <div class="col-2 text-center">
          <button type="button" class="btn btn-danger btn-sm removeBarang">❌</button>
        </div>
      `;
      barangFields.appendChild(newRow);
    });
  
    barangFields.addEventListener("click", function (event) {
      if (event.target.classList.contains("removeBarang")) {
        event.target.closest(".barang-row").remove();
      }
    });
  
    barangFields.addEventListener("input", function (event) {
      if (event.target.classList.contains("harga-satuan") || event.target.classList.contains("jumlah-barang")) {
        const value = event.target.value.replace(/\D/g, "");
        event.target.value = formatRupiah(value);
      }
    });
  
    barangForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      outputTableBody.innerHTML = "";
  
      const totalKewajibanBulanan = [
        "cicilanBulanan", "pengeluaranKeluarga", "pengeluaranToko", "targetTabungan"
      ].reduce((acc, id) => acc + parseRupiah(document.getElementById(id).value), 0);
  
      let labaKotor = 0;
  
      const barangRows = document.querySelectorAll(".barang-row");
      for (const row of barangRows) {
        const namaBarang = row.querySelector("input[name='namaBarang']").value;
        const jumlahBarang = parseRupiah(row.querySelector("input[name='jumlahBarang']").value) || 1;
        const hargaSatuan = parseRupiah(row.querySelector("input[name='hargaSatuan']").value) || 0;
  
        const hargaReferensi = await fetchHargaReferensi(namaBarang);
        let marginProfit = 0.2;
  
        if (hargaReferensi) {
          marginProfit = hargaSatuan < hargaReferensi ? 0.25 : 0.15;
        } else if (hargaSatuan > 100000) {
          marginProfit = 0.25;
        } else if (hargaSatuan < 50000) {
          marginProfit = 0.15;
        }
  
        const rekomendasiHargaJual = hargaSatuan + (hargaSatuan * marginProfit);
        const totalHargaJual = jumlahBarang * rekomendasiHargaJual;
        labaKotor += totalHargaJual - (jumlahBarang * hargaSatuan);
  
        const rowElement = document.createElement("tr");
        rowElement.innerHTML = `
          <td>${namaBarang}</td>
          <td>${formatRupiah(jumlahBarang)}</td>
          <td>Rp ${formatRupiah(hargaSatuan)}</td>
          <td>Rp ${formatRupiah(rekomendasiHargaJual.toFixed(0))}</td>
          <td>${(marginProfit * 100).toFixed(2)}%</td>
        `;
        outputTableBody.appendChild(rowElement);
      }
  
      const labaBersih = labaKotor - totalKewajibanBulanan;
      labaKotorElement.textContent = `Rp ${formatRupiah(labaKotor.toFixed(0))}`;
      labaBersihElement.textContent = `Rp ${formatRupiah(labaBersih.toFixed(0))}`;
    });
  });
  
