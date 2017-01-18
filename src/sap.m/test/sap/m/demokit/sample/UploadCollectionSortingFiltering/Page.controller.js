sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/m/UploadCollectionParameter',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Filter',
		'sap/ui/model/Sorter',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, UploadCollectionParameter, Fragment, Controller, Filter, Sorter, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.UploadCollectionSortingFiltering.Page", {

		_oDialog: null,

		onInit: function () {
			// set mock data
			var sPath = jQuery.sap.getModulePath("sap.m.sample.UploadCollectionSortingFiltering", "/uploadCollection.json");
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);

			var aDataCB = {
				"items" : [{
					"key" : "All",
					"text" : "sap.m.ListSeparators.All"
				}, {
					"key" : "None",
					"text" : "sap.m.ListSeparators.None"
				}],
				"selectedKey" : "All"
			};

			var oModelCB = new JSONModel();
			oModelCB.setData(aDataCB);

			var oSelect = this.getView().byId("tbSelect");
			oSelect.setModel(oModelCB);

			// Sets the text to the label
			this.getView().byId("UploadCollection").addEventDelegate({
				onBeforeRendering : function () {
					this.getView().byId("attachmentTitle").setText(this.getAttachmentTitleText());
				}.bind(this)
			});
		},

		onExit: function() {
			if (this._oDialog) {
				this._oDialog.destroy();
				this._oDialog = null;
			}
		},

		onViewSettingsClearFilters : function (oEvent) {
			this.onExit();
			//sort and filter items are empty
			this.onViewSettingsConfirm(oEvent);
		},

		formatAttribute : function (sValue, sType) {
			if (sType === "size") {
				jQuery.sap.require("sap.ui.core.format.FileSizeFormat");
				return sap.ui.core.format.FileSizeFormat.getInstance({
					binaryFilesize : false,
					maxFractionDigits : 1,
					maxIntegerDigits : 3
				}).format(sValue);
			} else {
				return sValue;
			}
		},

		onInfoToolbarPressed : function (oEvent) {
			if (oEvent.getParameters().srcControl === this.getView().byId("icClearFilters")) {
				this.onViewSettingsClearFilters(oEvent);
			} else {
				this.onViewSettingsPressed(oEvent);
			}
		},

		onViewSettingsPressed : function (oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("sap.m.sample.UploadCollectionSortingFiltering.Dialog", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		onViewSettingsConfirm : function (oEvent) {
			var oView = this.getView();
			var oUploadCollection = this.getView().byId("UploadCollection");
			var oInfoToolbar = oUploadCollection.getInfoToolbar();
			var oBindingItems = oUploadCollection.getBinding("items");
			var mParams = oEvent.getParameters();

			// apply sorter to binding
			var aSorters = [];
			if (mParams.sortItem) {
				var sPath = mParams.sortItem.getKey();
				var bDescending = mParams.sortDescending;
				aSorters.push(new Sorter(sPath, bDescending));
			}
			oBindingItems.sort(aSorters);

			// apply filters to binding
			var aFilters = [];
			jQuery.each(mParams.filterItems, function (i, oItem) {
				var aSplit = oItem.getKey().split("___");
				var sPath = aSplit[0];
				var sOperator = aSplit[1];
				var sValue1 = aSplit[2];
				var sValue2 = aSplit[3];
				var oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
				aFilters.push(oFilter);
			});
			oBindingItems.filter(aFilters);

			// update filter bar
			oInfoToolbar.setVisible(aFilters.length > 0);
			var sFilterString = "";
			if (mParams.filterString) {
				sFilterString = mParams.filterString;
			}
			oInfoToolbar.getContent()[0].setText(sFilterString);
		},

		onSelectChange:  function(oEvent) {
			var oUploadCollection = this.getView().byId("UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		},

		getAttachmentTitleText: function(){
			var aItems = this.getView().byId("UploadCollection").getItems();
			return "Uploaded (" + aItems.length + ")";
		}
	});

	return PageController;

});