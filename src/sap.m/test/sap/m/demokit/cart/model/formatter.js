sap.ui.define(["sap/ui/core/format/NumberFormat"], function (NumberFormat) {
	"use strict";

	var mStatusState = {
		"A": "Success",
		"O": "Warning",
		"D": "Error"
	};

	var formatter = {
		price: function (value) {
			var numberFormat = NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				minFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: ".",
				decimalSeparator: ","
			});
			return numberFormat.format(value);
		},

		totalPrice: function (oCartEntries) {
			var fTotalPrice = 0;

			Object.keys(oCartEntries).forEach(function (sProductId) {
				var oProduct = oCartEntries[sProductId];
				fTotalPrice += parseFloat(oProduct.Price) * oProduct.Quantity;
			});
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("CART_TOTAL_PRICE")
				+ ": " + formatter.price(fTotalPrice);
		},

		statusText: function (status) {
			var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			var mStatusText = {
				"A": oBundle.getText("STATUS_A"),
				"O": oBundle.getText("STATUS_O"),
				"D": oBundle.getText("STATUS_D")
			};

			return mStatusText[status] || status;
		},

		statusState: function (status) {
			return mStatusState[status] || "None";
		},

		pictureUrl: function (sUrl) {
			return jQuery.sap.getResourcePath("sap/ui/demo/cart/" + sUrl);
		},
		footerTextForCart: function (oSavedForLaterEntries) {
			if (Object.keys(oSavedForLaterEntries).length === 0) {
				return "";
			}
			return this.getView().getModel("i18n").getResourceBundle().getText("CART_SAVED_FOR_LATER_FOOTER_TEXT");
		}
	};

	return formatter;
});
