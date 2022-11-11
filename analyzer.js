const CSV_FIELDS = {
    1: "Timestamp",
    4: "Network Interface",
    5: "Source IP",
    6: "Destination IP",
    7: "Source Port",
    8: "Destination Port",
    14: "Rule",
    15: "Status"
};
const SORTED_FIELD_NUMBERS = Object.keys(CSV_FIELDS).sort();

const CSV_FILE_ID = "#CsvFile";
const FIELD_SELECT_ID = "#FieldSelection";
const TABLE_ID = "#DataTable";
const NO_DATA_ALERT_ID_RAW = "NoDataAlert";
const NO_DATA_ALERT_ID = "#" + NO_DATA_ALERT_ID_RAW;
const NO_DATA_ALERT = "<div class='alert alert-warning' role='alert' id='" + NO_DATA_ALERT_ID_RAW + "'>No Data</div>";
const LOAD_BUTTON_ID = "#LoadButton";

$(function() {
    renderNoData();
    renderFieldSelection();
    $(LOAD_BUTTON_ID).click(loadCsv)
});

function loadCsv() {
    readCsvFile(function(resultSet) {
        let filtered = filterResultSet(resultSet);
        renderCsv(filtered);
    });
}

function filterResultSet(resultSet) {
    let fields = selectedFields();
    return resultSet.filter(function(row, index) {
        return filterRow(row, index);
    }).map(function(row, index) {
            return filterColumn(row, fields);
    });
}

function filterRow(row, index) {
    return index > 0;
}

function filterColumn(row, fields) {
    let filtered = [];
    fields.forEach(function(value) {
        let cell = row[value - 1];
        filtered.push(cell)
    });
    return filtered;
}

function selectedFields() {
    return $(FIELD_SELECT_ID).val();
}

function selectedFieldNames() {
    let selectedValues = $(FIELD_SELECT_ID).val();
    let names = [];

    selectedValues.forEach(function(columnNumber) {
        names.push(CSV_FIELDS[columnNumber]);
    });

    console.log(names);
    return names;
}

function readCsvFile(handler) {
    let files = $(CSV_FILE_ID).prop("files");

    if (!files || files.length != 1) {
        handler();
        return;
    }

    let f = files[0];
    let fr = new FileReader();

    fr.readAsText(f);
    fr.onload = function(data) {
        let rawText = data.target.result;
        if (!rawText) {
            handler();
            return;
        }

        let lines = rawText.split(/\r\n|\n/);
        if (!lines || lines.length < 2) {
            handler();
            return;
        }

        let resultSet = [];
        lines.forEach(function(line) {
            let row = line.split(",");
            resultSet.push(row);
        });

        handler(resultSet);
    }
}

function renderFieldSelection() {
    SORTED_FIELD_NUMBERS.forEach(function(columnNumber) {
        const columnName = CSV_FIELDS[columnNumber];

        let optionHtml = "<option value='" + columnNumber + "'";
        if (columnNumber == SORTED_FIELD_NUMBERS[0]) {
            optionHtml += " selected";
        }
        optionHtml += ">" + columnName + "</option>";

        $(FIELD_SELECT_ID).append(optionHtml);
    })
}

function clearTable() {
    $(TABLE_ID).empty();
}

function renderNoData() {
    clearNoData();
    $(TABLE_ID).after(NO_DATA_ALERT);
}

function clearNoData() {
    $(NO_DATA_ALERT_ID).remove();
}

function renderCsv(resultSet) {
    if (!resultSet) {
       renderNoData();
       return;
    }

    clearNoData();
    clearTable();

    renderTableTitle(selectedFieldNames());
    renderTableBody(resultSet);
}

function renderTableTitle(names) {
    let html = "<thead><tr>";

    names.forEach(function(n) {
       html += "<th scope='col'>" + n + "</th>"
    });

    html += "</tr>";

    $(TABLE_ID).append(html);
}

function renderTableBody(resultSet) {
    let html = "<tbody>";

    resultSet.forEach(function(row) {
        html += "<tr>";

        row.forEach(function(value) {
            html += "<td>" + value + "</td>"
        });

        html += "</tr>";
    });

    html += "</tbody>";

    $(TABLE_ID).append(html);
}