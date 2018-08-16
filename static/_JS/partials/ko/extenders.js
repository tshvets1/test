define(["knockout"], function (ko) {
	ko.extenders.numeric = function (target, precision) {
		var result = ko.dependentObservable({
			read: function () {
				return target().toFixed(precision);
			},
			write: target
		});

		result.raw = target;
		return result;
	};

	ko.extenders.maxLength = function (target, length) {
		var result = ko.dependentObservable({
			read: function () {
				return target().toString().substring(0, length);
			},
			write: target
		});

		result.raw = target;
		return result;
	};

	ko.subscribable.fn.subscribeChanged = function (callback) {
		var savedValue = this.peek();
		return this.subscribe(function (latestValue) {
			var oldValue = savedValue;
			savedValue = latestValue;
			callback(latestValue, oldValue);
		});
	};

	ko.observableArray.fn.findFirst = function (condition) {
		var array = this();
		for (var i = 0; i < array.length; i++) {
			if (condition(array[i])) {
				return array[i];
			}
		}
	};

	ko.observableArray.fn.pushAll = function (valuesToPush) {
		var underlyingArray = this();
		this.valueWillMutate();
		ko.utils.arrayPushAll(underlyingArray, valuesToPush);
		this.valueHasMutated();
		return this;  //optional
	};

	ko.extenders.numericWithCommas = function (target, modificationCallback) {
	    var result = ko.pureComputed({
	        read: target,
	        write: function (newValue) {
	            var current = target();
	            var value = newValue.toString();
	            value = value.replace(/,/g, "");
	            var valueToWrite = modificationCallback(value);

	            //only write if it changed
	            if (valueToWrite !== current) {
	                target(valueToWrite);
	            } else {
	                if (newValue !== current) {
	                    target.notifySubscribers(valueToWrite);
	                }
	            }
                 
	        }
	    }).extend({ notify: 'always' });

	    return result;
	};
});