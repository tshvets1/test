function tradingHours() {

    var $tables = $(".trading-hours__rtf-block table");

	$tables.each(createTableForMobile);

	function createTableForMobile() {
	    var $table = $(this);
		var $firstRow = $table.find("tr:eq(0)").children();
		var $rows = $table.find("tr:gt(0)");
		var columnsCount = $firstRow.length;

		var $mobileTable = $("<table/>");
		$mobileTable.addClass("mobile-only-table");

		for (var i = 0; i < columnsCount; i++) {
			//columns of first row should take 100% width
			var $heading = $("<td>");
			$heading.attr("colspan", 2).text($firstRow[i].innerText);
			$mobileTable.append($("<tr>").addClass("heading").append($heading));

			//all columns except first will have "child" rows
			if (i > 0) {
				$rows.each(function (index, val) {
					var $row = $(this);
					var $tr = $("<tr>").addClass(index % 2 == 0 ? "even" : "odd");
					//add heading
					$tr.append($("<td>").html($($row.children()[0]).html()));
					//add value
					$tr.append($("<td>").html($($row.children()[i]).html()));

					$mobileTable.append($tr);
				})
			}
		}

		$table.addClass("mobile-hidden");
		$table.after($mobileTable);
	}
}

