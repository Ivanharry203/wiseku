document.addEventListener("DOMContentLoaded", function () {
  const addBarangButton = document.getElementById("addBarang");
  const barangFields = document.getElementById("barangFields");
  const barangForm = document.getElementById("barangForm");
  const outputTableBody = document.querySelector("#outputTable tbody");
  const labaKotorElement = document.getElementById("labaKotor");
  const labaBersihElement = document.getElementById("labaBersih");

  addBarangButton.addEventListener("click", function () {
      const newRow = document.createElement("div");
      newRow.classList.add("barang-row", "row", "g-3");
      newRow.innerHTML = `
          <div class="col-4">
              <input type="text" name="namaBarang" class="form-control" placeholder="Nama Barang" required>
          </div>
          <div class="col-4">
              <input type="number" name="jumlahBarang" class="form-control" placeholder="Jumlah Barang" min="1" required>
          </div>
          <div class="col-4">
              <input type="number" name="hargaSatuan" class="form-control" placeholder="Harga Satuan (Rp)" min="1" required>
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

  barangForm.addEventListener("submit", function (event) {
      event.preventDefault();
      outputTableBody.innerHTML = "";

      const jumlahModal = parseFloat(document.getElementById("jumlahModal").value) || 0;
      const jumlahHutang = parseFloat(document.getElementById("jumlahHutang").value) || 0;
      const bulanPelunasan = parseFloat(document.getElementById("bulanPelunasan").value) || 1;
      const cicilanBulanan = parseFloat(document.getElementById("cicilanBulanan").value) || 0;
      const pengeluaranKeluarga = parseFloat(document.getElementById("pengeluaranKeluarga").value) || 0;
      const pengeluaranToko = parseFloat(document.getElementById("pengeluaranToko").value) || 0;
      const targetTabungan = parseFloat(document.getElementById("targetTabungan").value) || 0;

      const totalKewajibanBulanan = cicilanBulanan + pengeluaranKeluarga + pengeluaranToko + targetTabungan;
      const totalModal = jumlahModal + jumlahHutang;
      let totalHargaModal = 0;
      let barangData = [];

      document.querySelectorAll(".barang-row").forEach(row => {
          const namaBarang = row.querySelector("input[name='namaBarang']").value;
          const jumlahBarang = parseFloat(row.querySelector("input[name='jumlahBarang']").value) || 1;
          const hargaSatuan = parseFloat(row.querySelector("input[name='hargaSatuan']").value) || 0;
          const totalHarga = jumlahBarang * hargaSatuan;
          totalHargaModal += totalHarga;

          barangData.push({ namaBarang, jumlahBarang, hargaSatuan, totalHarga });
      });

      const labaDibutuhkanPerBulan = totalKewajibanBulanan / bulanPelunasan;
      const persentaseLaba = (labaDibutuhkanPerBulan / totalModal) * 100;
      let labaKotor = 0;

      barangData.forEach(({ namaBarang, jumlahBarang, hargaSatuan, totalHarga }) => {
          let rekomendasiHargaJual = hargaSatuan + (hargaSatuan * (persentaseLaba / 100));
          let totalHargaJual = jumlahBarang * rekomendasiHargaJual;
          labaKotor += totalHargaJual - totalHarga;

          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${namaBarang}</td>
              <td>${jumlahBarang}</td>
              <td>Rp ${hargaSatuan.toLocaleString()}</td>
              <td>Rp ${rekomendasiHargaJual.toFixed(2).toLocaleString()}</td>
              <td>${persentaseLaba.toFixed(2)}%</td>
          `;
          outputTableBody.appendChild(row);
      });

      const labaBersih = labaKotor - totalKewajibanBulanan;
      labaKotorElement.textContent = `Rp ${labaKotor.toLocaleString()}`;
      labaBersihElement.textContent = `Rp ${labaBersih.toLocaleString()}`;
  });
});
