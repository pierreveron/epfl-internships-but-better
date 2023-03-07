rows = Array.from(document.querySelectorAll("[id^='idTableRccTr']"));

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

data = {};

const scrape = async () => {
  for (const [index, row] of rows.entries()) {
    if (index % 10 === 0) console.log((index / rows.length) * 100 + "%");
    id = parseInt(row.children[5].textContent);
    row.children[1].click();

    await delay(2500);

    length = document
      .querySelectorAll(".textCell")[0]
      .childNodes[7].textContent.trimStart();
    hiringTime = document
      .querySelectorAll(".textCell")[2]
      .childNodes[1].textContent.trimStart();

    salary = Array.from(document.getElementsByTagName("strong"))
      .find((e) => e.textContent === "Monthly salary")
      ?.nextSibling.textContent.trimStart();

    salary = salary?.length > 0 ? salary : null;

    data[id] = { length, hiringTime, salary };

    document.querySelector('input[value="Back"]').click();
    await delay(1000);
  }

  console.log("Done");
};
