$(function () {
	var QUIZ_RESULTS_KEY = "quiz.results";

	$(".quiz-module").each(function () {
		var $section = $(this);
		var $question = $section.find(".quiz-module__question");
		var $answers = $question.find(":radio[name='quizQuestion']");
		var questionId = $question.data("questionId");

		$section.on("click", "#proceedToQuiz", function (e) {
			e.preventDefault();
			var href = $(this).attr("href");
			var answer = $answers.filter(":checked").val();
			localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify([{questionId: questionId, answer: answer}]));
			document.location.href = href;
		});
	});

	$(".quiz-section").each(function () {
		var $section = $(this);
		var $progress = $section.find(".quiz__question-progress");
		var $questions = $section.find(".quiz__question");
		var $spinner = $section.find(".spinner");

		var resultsOnLoad = JSON.parse(localStorage.getItem(QUIZ_RESULTS_KEY) || "[]");
		var results = [];

		$questions.each(function (index, question) {
			var $question = $(this);
			var questionId = $question.data("questionId");
			var $li = $("<li>").attr("data-question-id", questionId).append($("<a>").text(index + 1));
			$progress.append($li);
		});
		$progress.append("<li class='last-child'><a>&#x2713;</a></li>");

		$section.on("mouseenter", "li[data-answer]", function (e) {
				var $answer = $(e.currentTarget);
				var src = $answer.data("imgHover");
				$answer.addClass("selected").find(".quiz__question-answer-icon img").attr("src", src);
			})
			.on("mouseleave", "li[data-answer]", function (e) {
				var $answer = $(e.currentTarget);
				var src = $answer.data("img");
				$answer.removeClass("selected").find(".quiz__question-answer-icon img").attr("src", src);
			});

		$(window).on("load", function () {
			$questions.hide();
			if (resultsOnLoad.length != 0) {
				$.each(resultsOnLoad, function (i, result) {
					var $question = $($questions[i]);
					if ($question.data("questionId") == result.questionId) {
						results.push(result);
						$progress.find("[data-question-id='" + result.questionId + "']").addClass("answered");
					} else {
						return false;
					}
				});
				$($questions[results.length]).fadeIn();
			} else {
				$questions.first().show();
			}
			$spinner.fadeOut();
			$section.children(".wrapper").fadeIn();
		});

		$section.on("click", "li[data-answer]", function (e) {
			var $this = $(this);
			$this.addClass("selected");
			var answer = $this.data("answer");
			var $question = $this.closest(".quiz__question");
			var questionId = $question.data("questionId");
			results.push({questionId: questionId, answer: answer});
			localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results));

			var $progressItem = $progress.find("[data-question-id='" + questionId + "']");
			$progressItem.addClass("answered");

			if ($question.next().is(".quiz__question")) {
			    $question.fadeOut(function () {
                    //clear selection
			        $questionToShow = $question.next();
			        $questionToShow.find("li[data-answer].selected").removeClass("selected");
					$questionToShow.fadeIn();
				});
			} else {
				$progressItem.next().addClass("answered");
				//todo: send result to Sitecore
				localStorage.removeItem(QUIZ_RESULTS_KEY);
				document.location.reload();
			}
		});

		$progress.children().click(function (e) {
			e.preventDefault();
			var $href = $(this);
			if ($href.hasClass("answered")) {
				$href.removeClass("answered").nextAll().removeClass("answered");

				var index = $progress.children().index($href);
				results.splice(index, 10);
				localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results));
				$questions.filter(":visible").fadeOut(500, function () {
				    var $questionToShow = $questions.filter("[data-question-id='" + $href.data("questionId") + "']");
                    //clear selection
				    $questionToShow.find("li[data-answer].selected").removeClass("selected");
				    $questionToShow.fadeIn(500);
				});
			}
		});
	});
});