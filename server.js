const express = require("express");
const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const app = express();
const port = 3000;

// Middleware para analizar JSON
app.use(express.json());

// URL y selectores de los campos en la página DIAN
const url =
  "https://muisca.dian.gov.co/WebRutMuisca/DefConsultaEstadoRUT.faces";
const id_input_nit = "vistaConsultaEstadoRUT:formConsultaEstadoRUT:numNit";
const id_boton_buscar =
  "vistaConsultaEstadoRUT:formConsultaEstadoRUT:btnBuscar";
const id_razon_social =
  "vistaConsultaEstadoRUT:formConsultaEstadoRUT:razonSocial";
const id_primer_apellido =
  "vistaConsultaEstadoRUT:formConsultaEstadoRUT:primerApellido";
const id_segundo_apellido =
  "vistaConsultaEstadoRUT:formConsultaEstadoRUT:segundoApellido";
const id_primer_nombre =
  "vistaConsultaEstadoRUT:formConsultaEstadoRUT:primerNombre";
const id_segundo_nombre =
  "vistaConsultaEstadoRUT:formConsultaEstadoRUT:otrosNombres";
const id_digito_verificacion =
  "vistaConsultaEstadoRUT:formConsultaEstadoRUT:dv";

// Ruta de scraping
app.post("/scrape", async (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res
      .status(400)
      .json({ error: "Se necesita un número para hacer scraping." });
  }

  let driver;

  try {
    // Configuración para ejecutar Chrome en modo headless
    const options = new chrome.Options();
    options.addArguments("--headless");

    // Iniciar Selenium WebDriver
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

    // Abrir la página DIAN
    await driver.get(url);

    // Localizar la caja de texto e ingresar el número de NIT
    const inputBox = await driver.findElement(By.id(id_input_nit));
    await inputBox.clear();
    await inputBox.sendKeys(number);

    // Localizar y hacer clic en el botón de búsqueda
    const searchButton = await driver.findElement(By.id(id_boton_buscar));
    await searchButton.click();

    // Esperar a que los resultados se carguen
    await driver.sleep(2000); // Ajusta el tiempo si es necesario

    // Obtener la información de la página
    const digitoVerificacion = await getTextById(
      driver,
      id_digito_verificacion
    );
    const razonSocial = await getTextById(driver, id_razon_social);

    if (razonSocial) {
      return res.json({
        tipo: "empresa",
        razon_social: razonSocial,
        digito_verificacion: digitoVerificacion,
      });
    }

    const primerApellido = await getTextById(driver, id_primer_apellido);
    const segundoApellido = await getTextById(driver, id_segundo_apellido);
    const primerNombre = await getTextById(driver, id_primer_nombre);
    const segundoNombre = await getTextById(driver, id_segundo_nombre);

    // Si no se encuentra información de nombres o apellidos, devolver error
    if (!primerNombre && !primerApellido) {
      return res.status(404).json({ error: "NIT no encontrado" });
    }

    // Devolver la información de la persona
    res.json({
      tipo: "persona",
      primer_nombre: primerNombre,
      segundo_nombre: segundoNombre,
      primer_apellido: primerApellido,
      segundo_apellido: segundoApellido,
      digito_verificacion: digitoVerificacion,
    });
  } catch (error) {
    console.error("Error en scraping:", error);
    res.status(500).json({ error: "Error en scraping" });
  } finally {
    // Cerrar el navegador
    if (driver) {
      await driver.quit();
    }
  }
});

// Función auxiliar para obtener el texto de un elemento por su ID
async function getTextById(driver, id) {
  try {
    const element = await driver.findElement(By.id(id));
    return await element.getText();
  } catch (err) {
    return null;
  }
}

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
