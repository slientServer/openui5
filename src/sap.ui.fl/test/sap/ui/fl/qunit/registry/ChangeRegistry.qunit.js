/*globals QUnit*/
jQuery.sap.require("sap.ui.fl.registry.ChangeRegistry");
jQuery.sap.require("sap.ui.fl.registry.ChangeTypeMetadata");
jQuery.sap.require("sap.ui.fl.registry.ChangeRegistryItem");
jQuery.sap.require("sap.ui.fl.registry.SimpleChanges");
jQuery.sap.require("sap.ui.fl.registry.Settings");

(function (ChangeRegistry, ChangeTypeMetadata, ChangeRegistryItem, SimpleChanges, Settings) {
	"use strict";

	QUnit.module("sap.ui.fl.registry.ChangeRegistry", {
		setup: function () {
			this.stubs = [];

			// create new instance of ChangeRegistry
			this.instance = new ChangeRegistry();

		},
		teardown: function () {
			this.stubs.forEach(function (stub) {
				stub.restore();
			});

		}
	});

	QUnit.test("getInstance", function (assert) {
		var changeRegistryInstance = ChangeRegistry.getInstance();
		assert.ok(changeRegistryInstance);
	});

	QUnit.test("on load uxap changeHandler are registered", function (assert) {
		var changeRegistryInstance = ChangeRegistry.getInstance();

		assert.ok(changeRegistryInstance._registeredItems, "sap.uxap.ObjectPageLayout");
		assert.ok(changeRegistryInstance._registeredItems, "sap.uxap.ObjectPageSection");
	});

	QUnit.test("constructor", function (assert) {
		assert.ok(this.instance);
		assert.deepEqual(this.instance._registeredItems, {});
	});

	QUnit.test("addRegistryItem", function (assert) {
		//Arrange
		var registryItem = {
			getControlType: function () {
				return "sap.ui.fl.DummyControl";
			},
			getChangeTypeName: function () {
				return "myChangeType";
			}
		};

		//Act
		this.instance.addRegistryItem(registryItem);

		//Assert
		assert.strictEqual(Object.keys(this.instance._registeredItems).length, 1);
		assert.strictEqual(this.instance._registeredItems["sap.ui.fl.DummyControl"]["myChangeType"], registryItem);
	});

	QUnit.test("removeRegistryItem - remove complete item", function (assert) {
		//Arrange
		var registryItem = {
			getControlType: function () {
				return "sap.ui.fl.DummyControl";
			},
			getChangeTypeName: function () {
				return "myChangeType";
			}
		};
		this.instance.addRegistryItem(registryItem);

		//Act
		var mParam = {
			controlType: "sap.ui.fl.DummyControl",
			changeTypeName: "myChangeType"
		};
		this.instance.removeRegistryItem(mParam);

		//Assert
		assert.strictEqual(Object.keys(this.instance._registeredItems).length, 0);
	});

	QUnit.test("removeRegistryItem - remove changetypemetadata only", function (assert) {
		//Arrange
		var registryItem1 = {
			getControlType: function () {
				return "sap.ui.fl.DummyControl";
			},
			getChangeTypeName: function () {
				return "myChangeType";
			}
		};
		var registryItem2 = {
			getControlType: function () {
				return "sap.ui.fl.DummyControlGroup";
			},
			getChangeTypeName: function () {
				return "myChangeType";
			}
		};
		this.instance.addRegistryItem(registryItem1);
		this.instance.addRegistryItem(registryItem2);
		assert.strictEqual(Object.keys(this.instance._registeredItems).length, 2);

		//Act
		var mParam = {
			changeTypeName: "myChangeType"
		};
		this.instance.removeRegistryItem(mParam);

		//Assert
		assert.strictEqual(Object.keys(this.instance._registeredItems).length, 2);
		assert.strictEqual(Object.keys(this.instance._registeredItems["sap.ui.fl.DummyControl"]).length, 0);
		assert.strictEqual(Object.keys(this.instance._registeredItems["sap.ui.fl.DummyControlGroup"]).length, 0);
	});

	QUnit.test("removeRegistryItem - remove complete controltype", function (assert) {
		//Arrange
		var registryItem1 = {
			getControlType: function () {
				return "sap.ui.fl.DummyControl";
			},
			getChangeTypeName: function () {
				return "myChangeType1";
			}
		};
		var registryItem2 = {
			getControlType: function () {
				return "sap.ui.fl.DummyControlGroup";
			},
			getChangeTypeName: function () {
				return "myChangeType2";
			}
		};
		this.instance.addRegistryItem(registryItem1);
		this.instance.addRegistryItem(registryItem2);
		assert.strictEqual(Object.keys(this.instance._registeredItems).length, 2);

		//Act
		var mParam = {
			controlType: "sap.ui.fl.DummyControl"
		};
		this.instance.removeRegistryItem(mParam);

		//Assert
		assert.strictEqual(Object.keys(this.instance._registeredItems).length, 1);
		assert.strictEqual(Object.keys(this.instance._registeredItems["sap.ui.fl.DummyControlGroup"]).length, 1);
		assert.deepEqual(this.instance._registeredItems["sap.ui.fl.DummyControlGroup"]["myChangeType2"], registryItem2);
	});

	QUnit.test("getRegistryItem - identified by controlType and changeTypeName", function (assert) {
		//Arrange
		var simpleDummyControlChange1 = {
			"changeType": "myChangeType1",
			"changeHandler": {} // stub
		};
		var registryItem1 = this.instance._createChangeRegistryItemForSimpleChange("sap.ui.fl.DummyControl", simpleDummyControlChange1);

		var simpleDummyControlChange2 = {
			"changeType": "myChangeType2",
			"changeHandler": {} // stub
		};
		var registryItem2 = this.instance._createChangeRegistryItemForSimpleChange("sap.ui.fl.DummyControlGroup", simpleDummyControlChange2);
		this.instance.addRegistryItem(registryItem1);
		this.instance.addRegistryItem(registryItem2);

		assert.strictEqual(Object.keys(this.instance._registeredItems).length, 2);

		//Act
		var mParam = {
			controlType: "sap.ui.fl.DummyControl",
			changeTypeName: "myChangeType1"
		};
		var result = this.instance.getRegistryItems(mParam);

		//Assert
		assert.strictEqual(Object.keys(result).length, 1);
		assert.deepEqual(result["sap.ui.fl.DummyControl"], {"myChangeType1": registryItem1});

	});

	QUnit.test("getRegistryItem - identified by controlType", function (assert) {
		//Arrange
		var simpleDummyControlChange1 = {
			"changeType": "myChangeType1",
			"changeHandler": {} // stub
		};
		var registryItem1 = this.instance._createChangeRegistryItemForSimpleChange("sap.ui.fl.DummyControl1", simpleDummyControlChange1);

		var simpleDummyControlChange2 = {
			"changeType": "myChangeType2",
			"changeHandler": {} // stub
		};
		var registryItem2 = this.instance._createChangeRegistryItemForSimpleChange("sap.ui.fl.DummyControl2", simpleDummyControlChange2);
		this.instance.addRegistryItem(registryItem1);
		this.instance.addRegistryItem(registryItem2);

		//Act
		var result = this.instance.getRegistryItems({controlType: "sap.ui.fl.DummyControl1"});

		//Assert
		assert.ok(result);
		assert.strictEqual(Object.keys(result).length, 1);
		assert.deepEqual(result["sap.ui.fl.DummyControl1"], {"myChangeType1": registryItem1});
	});

	QUnit.test("getRegistryItem - identified by controlType, filter by layer", function (assert) {
		//Arrange
		var simpleDummyControlChange1 = {
			"changeType": "myChangeType1",
			"changeHandler": {} // stub
		};
		var registryItem1 = this.instance._createChangeRegistryItemForSimpleChange("sap.ui.fl.DummyControl1", simpleDummyControlChange1);

		var simpleDummyControlChange2 = {
			"changeType": "myChangeType2",
			"changeHandler": {} // stub
		};
		var registryItem2 = this.instance._createChangeRegistryItemForSimpleChange("sap.ui.fl.DummyControl2", simpleDummyControlChange2);
		this.instance.addRegistryItem(registryItem1);
		this.instance.addRegistryItem(registryItem2);

		this.instance._oSettings._oSettings.features.myChangeType2 = [ "VENDOR" ];

		//Act
		//will be found since myChangeType1 is not registered in Settings
		var result = this.instance.getRegistryItems({controlType: "sap.ui.fl.DummyControl1", layer: "USER"});

		//Assert
		assert.ok(result);
		assert.strictEqual(Object.keys(result).length, 1);
		assert.deepEqual(result["sap.ui.fl.DummyControl1"], {"myChangeType1": registryItem1});

		//Act
		//will not be found since myChangeType2 is registered in Settings, but only for VENDOR
		result = this.instance.getRegistryItems({controlType: "sap.ui.fl.DummyControl2", layer: "USER"});

		//Assert
		assert.ok(result);
		assert.strictEqual(Object.keys(result).length, 1);
		assert.deepEqual(result["sap.ui.fl.DummyControl2"], {});
		assert.deepEqual(this.instance._registeredItems["sap.ui.fl.DummyControl2"], {"myChangeType2": registryItem2});

	});

	QUnit.test("getRegistryItem - identified by changeTypeName", function (assert) {
		//Arrange
		var simpleDummyControlChange1 = {
			"changeType": "myChangeType1",
			"changeHandler": {} // stub
		};
		var registryItem1 = this.instance._createChangeRegistryItemForSimpleChange("sap.ui.fl.DummyControl1", simpleDummyControlChange1);

		var simpleDummyControlChange2 = {
			"changeType": "myChangeType2",
			"changeHandler": {} // stub
		};
		var registryItem2 = this.instance._createChangeRegistryItemForSimpleChange("sap.ui.fl.DummyControl2", simpleDummyControlChange2);
		this.instance.addRegistryItem(registryItem1);
		this.instance.addRegistryItem(registryItem2);

		assert.strictEqual(Object.keys(this.instance._registeredItems).length, 2);

		//Act
		var mParam = {
			changeTypeName: "myChangeType1"
		};
		var result = this.instance.getRegistryItems(mParam);

		//Assert
		assert.strictEqual(Object.keys(result).length, 1);
		assert.deepEqual(result["sap.ui.fl.DummyControl1"], {"myChangeType1": registryItem1});

	});

	QUnit.test("registerChangeHandlersForControl understands 'default' as a parameter", function (assert) {

		var someChangeType = "someChange";
		var sSomeChangeModuleName = "some/module/name";
		var sHideControlChangeType = "hideControl";

		var sControlType = "my.control.Implementation";
		var oChangeHandlers = {};
		oChangeHandlers[someChangeType] = sSomeChangeModuleName;
		oChangeHandlers[sHideControlChangeType] = "default";

		var registerControlStub = this.stub(this.instance, "registerControlForSimpleChange");

		this.instance._registerChangeHandlersForControl(sControlType, oChangeHandlers);

		assert.equal(registerControlStub.callCount, 2, "two change handlers were registered for the control");
		assert.equal(registerControlStub.firstCall.args[0], sControlType, "the first registration was for the passed control");
		assert.equal(registerControlStub.firstCall.args[1].changeType, someChangeType, "the some change type was registered");
		assert.equal(registerControlStub.firstCall.args[1].changeHandler, sSomeChangeModuleName, "the 'some/module/name' module was registerd for the 'some change' type");
		assert.equal(registerControlStub.secondCall.args[0], sControlType, "the second registration was for the passed control");
		assert.equal(registerControlStub.secondCall.args[1].changeType, sHideControlChangeType, "the hideControl change type was registered");
		assert.equal(registerControlStub.secondCall.args[1].changeHandler, this.instance._oDefaultChangeHandlers[sHideControlChangeType], "the default change handler was registerd for the 'hideControl' type");

	});

	QUnit.test("registerChangeHandlersForControl understands a module path as a parameter", function (assert) {
		var sControlType = "my.control.Implementation";
		var oChangeHandlers = "sap/ui/fl/test/registry/TestChangeHandlers";
		var bProcessingContinues = false;

		var registerControlStub = this.stub(this.instance, "registerControlForSimpleChange");

		this.instance._registerChangeHandlersForControl(sControlType, oChangeHandlers);

		assert.equal(registerControlStub.callCount, 2, "two change handlers were registered for the control");
		assert.equal(registerControlStub.firstCall.args[0], sControlType, "the first registration was for the passed control");
		assert.equal(registerControlStub.firstCall.args[1].changeType, "doSomething", "the some change type was registered");
		assert.equal(registerControlStub.secondCall.args[0], sControlType, "the second registration was for the passed control");
		assert.equal(registerControlStub.secondCall.args[1].changeType, "doSomethingElse", "the hideControl change type was registered");
	});

	QUnit.test("registerChangeHandlersForControl does not crash if the loading of a module path leads to an error (file not found)", function (assert) {
		var sControlType = "my.control.Implementation";
		var oChangeHandlers = "sap/ui/fl/test/registry/DefinitelyNotAChangeHandlers";
		var bProcessingContinues = false;

		var registerControlStub = this.stub(this.instance, "registerControlForSimpleChange");
		var errorLoggingStub = this.stub(sap.ui.fl.Utils.log, "error");

		this.instance._registerChangeHandlersForControl(sControlType, oChangeHandlers);

		bProcessingContinues = true;

		assert.ok(bProcessingContinues, "the js processing continues");
		assert.equal(registerControlStub.callCount, 0, "no registration was done");
		assert.equal(errorLoggingStub.callCount, 1, "the error was logged");
	});

	QUnit.test("registerChangeHandlersForControl does not crash if the loading of a module path leads to an error (broken file)", function (assert) {
		var sControlType = "my.control.Implementation";
		var oChangeHandlers = "sap/ui/fl/test/registry/TestChangeHandlersBROKEN";
		var bProcessingContinues = false;

		var registerControlStub = this.stub(this.instance, "registerControlForSimpleChange");
		var errorLoggingStub = this.stub(sap.ui.fl.Utils.log, "error");

		this.instance._registerChangeHandlersForControl(sControlType, oChangeHandlers);

		bProcessingContinues = true;

		assert.ok(bProcessingContinues, "the js processing continues");
		assert.equal(registerControlStub.callCount, 0, "no registration was done");
		assert.equal(errorLoggingStub.callCount, 1, "the error was logged");
	});

	QUnit.test("registerControlsForChanges shall add a map of controls and changes to the registry", function (assert) {
		this.instance.registerControlsForChanges({
			'controlA': [SimpleChanges.unhideControl, SimpleChanges.hideControl],
			'controlB': [SimpleChanges.unhideControl, SimpleChanges.hideControl]
		});

		var oRegistryItemsA = this.instance.getRegistryItems({
			controlType: "controlA"
		});

		var oRegistryItemsB = this.instance.getRegistryItems({
			controlType: "controlB"
		});

		assert.ok(oRegistryItemsA.controlA.unhideControl);
		assert.ok(oRegistryItemsA.controlA.hideControl);
		assert.ok(oRegistryItemsB.controlB.unhideControl);
		assert.ok(oRegistryItemsB.controlB.hideControl);
	});

	QUnit.test("registerControlForSimpleChange shall do nothing if mandatory parameters are missing", function (assert) {
		//Call CUT
		this.instance.registerControlForSimpleChange(null, null);

		assert.strictEqual(Object.keys(this.instance._registeredItems).length, 0, "There shall be no registered items");
	});

	QUnit.test("registerControlForSimpleChange shall add a new registry item", function (assert) {

		//Call CUT
		this.instance.registerControlForSimpleChange("ganttChart", SimpleChanges.unhideControl);

		var oRegistryItems = this.instance.getRegistryItems({
			controlType: "ganttChart"
		});

		assert.ok(oRegistryItems);
		assert.ok(oRegistryItems.ganttChart);
		assert.ok(oRegistryItems.ganttChart);

	});


	QUnit.test("_filterChangeTypes", function (assert) {
		var registryItem1 = {
			getControlType: function () {
				return "sap.ui.fl.DummyControl1";
			},
			getChangeTypeName: function () {
				return "myChangeType1";
			}
		};
		var registryItem2 = {
			getControlType: function () {
				return "sap.ui.fl.DummyControl2";
			},
			getChangeTypeName: function () {
				return "myChangeType2";
			}
		};
		var registryItem2b = {
			getControlType: function () {
				return "sap.ui.fl.DummyControl2";
			},
			getChangeTypeName: function () {
				return "myChangeType2b";
			}
		};
		var registryItem3 = {
			getControlType: function () {
				return "sap.ui.fl.DummyControl3";
			},
			getChangeTypeName: function () {
				return "myChangeType3";
			}
		};
		this.instance.addRegistryItem(registryItem1);
		this.instance.addRegistryItem(registryItem2);
		this.instance.addRegistryItem(registryItem2b);
		this.instance.addRegistryItem(registryItem3);
		var oSettings = {
			isKeyUser: false,
			features: {
				"myChangeType1": ["VENDOR"],
				"myChangeType2": [],
				"myChangeType2b": ["VENDOR"]
			}
		};
		this.instance._oSettings = new Settings(oSettings);
		var oSettingsSpy = this.spy(this.instance._oSettings, "isChangeTypeEnabled");

		var oRegistryItems = {};
		jQuery.each(this.instance._registeredItems, function (sControlType, oControlReg) {
			oRegistryItems[sControlType] = {};
			jQuery.each(oControlReg, function (sChangeType, oRegistryItem) {
				oRegistryItems[sControlType][sChangeType] = oRegistryItem;
			});
		});

		//leave out the layer to do no filtering
		this.instance._filterChangeTypes(oRegistryItems);
		assert.strictEqual(oSettingsSpy.callCount, 0);
		//do filtering for the VENDOR layer
		this.instance._filterChangeTypes(oRegistryItems, "VENDOR");
		//spy should be called once per registry item
		assert.strictEqual(oSettingsSpy.callCount, 4);
		//change type that is enabled for VENDOR
		assert.ok(oRegistryItems["sap.ui.fl.DummyControl1"]["myChangeType1"]);
		//change type that is disabled completely
		assert.ok(!oRegistryItems["sap.ui.fl.DummyControl2"]["myChangeType2"]);
		//ensure that the registry itself is no affected by the modification
		assert.ok(this.instance._registeredItems["sap.ui.fl.DummyControl2"]["myChangeType2"]);
		//change type in same control that is enabled for VENDOR
		assert.ok(oRegistryItems["sap.ui.fl.DummyControl2"]["myChangeType2b"]);
		//change type that is not part of the feature list
		assert.ok(oRegistryItems["sap.ui.fl.DummyControl3"]["myChangeType3"]);
	});

	QUnit.test("can determine if a given control has registered change handlers", function (assert) {
		//Arrange
		var sControlType = "sap.ui.fl.DummyControl";

		var registryItem = {
			getControlType: function () {
				return sControlType;
			},
			getChangeTypeName: function () {
				return "myChangeType";
			}
		};

		//Act
		this.instance.addRegistryItem(registryItem);

		var bHasRegisteredChangeHandlers = this.instance.hasRegisteredChangeHandlersForControl(sControlType);

		assert.strictEqual(bHasRegisteredChangeHandlers, true, "the registry tells that there is a registered change handler for the given control");
	});

	QUnit.test("can determine if a given control has NO registered change handlers", function (assert) {
		//Arrange
		var sControlType = "sap.ui.fl.DummyControl";
		var sSomeOtherControlType = "sap.ui.fl.DummyControlWithNoHandlers";

		var registryItem = {
			getControlType: function () {
				return sControlType;
			},
			getChangeTypeName: function () {
				return "myChangeType";
			}
		};

		//Act
		this.instance.addRegistryItem(registryItem);

		var bHasRegisteredChangeHandlers = this.instance.hasRegisteredChangeHandlersForControl(sSomeOtherControlType);

		assert.strictEqual(bHasRegisteredChangeHandlers, false, "the registry tells that there is NO a registered change handler for the given control");
	});

	QUnit.test("can determine if a given control has a change handler for a specific type of changes", function (assert) {
		//Arrange
		var sControlType = "sap.ui.fl.DummyControl";
		var sChangeType = "myChangeType";

		var registryItem = {
			getControlType: function () {
				return sControlType;
			},
			getChangeTypeName: function () {
				return sChangeType;
			}
		};

		//Act
		this.instance.addRegistryItem(registryItem);

		var bHasRegisteredChangeHandlers = this.instance.hasChangeHandlerForControlAndChange(sControlType, sChangeType);

		assert.strictEqual(bHasRegisteredChangeHandlers, true, "the registry tells that there is a registered change handler for the given control and change");
	});

	QUnit.test("can determine if a given control has NOT a change handler for a specific change type if it has no change handlers at all registered for that control", function (assert) {
		//Arrange
		var sControlType = "sap.ui.fl.DummyControl";
		var sChangeType = "myChangeType";
		var sSomeOtherControlType = "sap.ui.fl.DummyControlWithNoHandlers";

		var registryItem = {
			getControlType: function () {
				return sControlType;
			},
			getChangeTypeName: function () {
				return sChangeType;
			}
		};

		//Act
		this.instance.addRegistryItem(registryItem);

		var bHasRegisteredChangeHandlers = this.instance.hasChangeHandlerForControlAndChange(sSomeOtherControlType, sChangeType);

		assert.strictEqual(bHasRegisteredChangeHandlers,  false, "the registry tells that there is NO registered change handler for the given control and change");
	});

	QUnit.test("can determine if a given control has NOT a change handler for a specific change type if it has some change handlers registered for other change types for that control", function (assert) {
		//Arrange
		var sControlType = "sap.ui.fl.DummyControl";
		var sChangeType = "myChangeType";
		var sSomeOtherChangeType = "myOtherChangeType";

		var registryItem = {
			getControlType: function () {
				return sControlType;
			},
			getChangeTypeName: function () {
				return sChangeType;
			}
		};

		//Act
		this.instance.addRegistryItem(registryItem);

		var bHasRegisteredChangeHandlers = this.instance.hasChangeHandlerForControlAndChange(sControlType, sSomeOtherChangeType);

		assert.strictEqual(bHasRegisteredChangeHandlers, false, "the registry tells that there is NO registered change handler for the given control and change");
	});

	QUnit.test("can determine if a given control has NOT a change handler for a specific control if neither the control has registered change handlers nor the change handler is registered anywhere else", function (assert) {
		//Arrange
		var sControlType = "sap.ui.fl.DummyControl";
		var sChangeType = "myChangeType";
		var sSomeOtherControlType = "sap.ui.fl.DummyControlWithNoHandlers";
		var sSomeOtherChangeType = "myOtherChangeType";

		var registryItem = {
			getControlType: function () {
				return sControlType;
			},
			getChangeTypeName: function () {
				return sChangeType;
			}
		};

		//Act
		this.instance.addRegistryItem(registryItem);

		var bHasRegisteredChangeHandlers = this.instance.hasChangeHandlerForControlAndChange(sSomeOtherControlType, sSomeOtherChangeType);

		assert.strictEqual(bHasRegisteredChangeHandlers, false, "the registry tells that there is NO registered change handler for the given control and change");
	});

	QUnit.test("returns the property change handler for a control not having any explicit registered change handlers", function (assert) {
		var sControlType = "aControlType";
		var sPropertyChangeType = "propertyChange";

		var oChangeHandler = this.instance._getOrLoadChangeHandler(sControlType, sPropertyChangeType);

		assert.equal(oChangeHandler, this.instance._oDefaultActiveChangeHandlers.propertyChange, "the default property change handler was retrieved");
	});

	QUnit.test("returns the property change handler for a control having other registered change handlers", function (assert) {
		var sControlType = "aControlType";
		var sPropertyChangeType = "propertyChange";

		this.instance._registeredItems[sControlType] = {
			"someOtherChange": {}
		};

		var oChangeHandler = this.instance._getOrLoadChangeHandler(sControlType, sPropertyChangeType);

		assert.equal(oChangeHandler, this.instance._oDefaultActiveChangeHandlers.propertyChange, "the default property change handler was retrieved");
	});

	QUnit.test("returns the explicit for a given control type registered change handler for the property changes", function (assert) {
		var sControlType = "aControlType";
		var sPropertyChangeType = "propertyChange";
		var oExplicitRegisteredChangeHandlerStub = {};
		var oSimpleChangeObject = {
			changeType: sPropertyChangeType,
			changeHandler: oExplicitRegisteredChangeHandlerStub
		};

		var oChangeRegistryItem = this.instance._createChangeRegistryItemForSimpleChange(sControlType, oSimpleChangeObject);

		this.instance._registeredItems[sControlType] = {
			"someOtherChange": {},
			"propertyChange": oChangeRegistryItem
		};

		var oChangeHandler = this.instance._getOrLoadChangeHandler(sControlType, sPropertyChangeType);

		assert.equal(oChangeHandler, oChangeRegistryItem, "the explicit registered change handler item was retrieved");
	});

	QUnit.test("returns the property binding change handler for a control not having any explicit registered change handlers", function (assert) {
		var sControlType = "aControlType";
		var sPropertyBindingChangeType = "propertyBindingChange";

		var oChangeHandler = this.instance._getOrLoadChangeHandler(sControlType, sPropertyBindingChangeType);

		assert.equal(oChangeHandler, this.instance._oDefaultActiveChangeHandlers.propertyBindingChange, "the default property binding change handler was retrieved");
	});

	QUnit.test("returns the property change handler for a control having other registered change handlers", function (assert) {
		var sControlType = "aControlType";
		var sPropertyBindingChangeType = "propertyBindingChange";

		this.instance._registeredItems[sControlType] = {
			"someOtherChange": {}
		};

		var oChangeHandler = this.instance._getOrLoadChangeHandler(sControlType, sPropertyBindingChangeType);

		assert.equal(oChangeHandler, this.instance._oDefaultActiveChangeHandlers.propertyBindingChange, "the default property binding change handler was retrieved");
	});

	QUnit.test("returns the explicit for a given control type registered change handler for the property binding changes", function (assert) {
		var sControlType = "aControlType";
		var sPropertyBindingChangeType = "propertyBindingChange";
		var oExplicitRegisteredChangeHandlerStub = {};
		var oSimpleChangeObject = {
			changeType: sPropertyBindingChangeType,
			changeHandler: oExplicitRegisteredChangeHandlerStub
		};

		var oChangeRegistryItem = this.instance._createChangeRegistryItemForSimpleChange(sControlType, oSimpleChangeObject);

		this.instance._registeredItems[sControlType] = {
			"someOtherChange": {},
			"propertyBindingChange": oChangeRegistryItem
		};

		var oChangeHandler = this.instance._getOrLoadChangeHandler(sControlType, sPropertyBindingChangeType);

		assert.equal(oChangeHandler, oChangeRegistryItem, "the explicit registered change handler item was retrieved");
	});

}(sap.ui.fl.registry.ChangeRegistry, sap.ui.fl.registry.ChangeTypeMetadata, sap.ui.fl.registry.ChangeRegistryItem, sap.ui.fl.registry.SimpleChanges, sap.ui.fl.registry.Settings));
