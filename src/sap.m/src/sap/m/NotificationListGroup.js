/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', './NotificationListBase'],
	function (jQuery, library, Control, NotificationListBase ) {

	'use strict';

	/**
	 * Constructor for a new NotificationListGroup.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The NotificationListItemGroup control is used for grouping NotificationListItems of the same type.
	 * @extends sap.m.NotificationListBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34
	 * @alias sap.m.NotificationListGroup
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NotificationListGroup = NotificationListBase.extend('sap.m.NotificationListGroup', /** @lends sap.m.NotificationListGroup.prototype */ {
		metadata: {
			library: 'sap.m',
			properties: {

				/**
				 * Determines if the group is collapsed or expanded.
				 */
				collapsed: {type: 'boolean', group: 'Behavior', defaultValue: false},

				/**
				 * Determines if the group will automatically set the priority based on the highest priority of its notifications or get its priority from the developer.
				 */
				autoPriority: {type: 'boolean', group: 'Behavior', defaultValue: true},

				/**
				 * Determines if the group header/footer of the empty group will be always shown. By default groups with 0 notifications are not shown.
				 */
				showEmptyGroup: {type: 'boolean', group: 'Behavior', defaultValue: false},

				/**
				 * Determines if the collapse/expand button should be enabled for an empty group.
				 */
				enableCollapseButtonWhenEmpty: {type: 'boolean', group: 'Behavior', defaultValue: false}
			},
			defaultAggregation : "items",
			aggregations: {

				/**
				 * The NotificationListItems inside the group.
				 */
				items: {type: 'sap.m.NotificationListItem', multiple: true, singularName: 'item'}
			},
			events: {
				/**
				 * This event is called when collapse property value is changed
				 * @since 1.44
				 */
				onCollapse: {
					parameters: {
						/**
						 * Indicates exact collapse direction
						 */
						collapsed: {type: "boolean"}
					}
				}
			}
		}
	});

	NotificationListGroup.prototype.init = function () {
		sap.m.NotificationListBase.prototype.init.call(this);

		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		this._closeText = resourceBundle.getText('NOTIFICATION_LIST_BASE_CLOSE');

		/**
		 * @type {sap.m.Button}
		 * @private
		 */
		var _closeButton = new sap.m.Button(this.getId() + '-closeButton', {
			type: sap.m.ButtonType.Transparent,
			icon: sap.ui.core.IconPool.getIconURI('decline'),
			tooltip: this._closeText,
			press: function () {
				this.close();
			}.bind(this)
		});

		this.setAggregation("_closeButton", _closeButton, true);

		/**
		 * @type {sap.m.Button}
		 * @private
		 */
		var _collapseButton = new sap.m.Button({
			type: sap.m.ButtonType.Transparent,
			press: function () {
				this.setCollapsed(!this.getCollapsed());
			}.bind(this)
		});

		this.setAggregation("_collapseButton", _collapseButton, true);
		this._maxNumberReached = false;
	};

	//================================================================================
	// Overwritten setters and getters
	//================================================================================

	NotificationListGroup.prototype.setCollapsed = function (collapsed) {
		this._toggleCollapsed();
		//Setter overwritten to suppress invalidation

		this.setProperty('collapsed', collapsed, true);
		this.fireOnCollapse({collapsed: collapsed});

		return this;
	};

	NotificationListGroup.prototype.getPriority = function () {
		//If the autoPriority flag is off then return what has been set by the developer
		if (!this.getAutoPriority()) {
			return this.getProperty('priority');
		}

		/** @type {sap.m.NotificationListItem[]} */
		var notifications = this.getAggregation('items');

		/** @type {sap.ui.core.Priority|string} */
		var priority = sap.ui.core.Priority.None;

		if (notifications) {
			notifications.forEach(function (item) {
				priority = comparePriority(priority, item.getPriority());
			});
		} else {
			priority = this.getProperty('priority');
		}

		return priority;
	};

	NotificationListGroup.prototype.getUnread = function () {
		/** @type {sap.m.NotificationListItem[]} */
		var notifications = this.getAggregation('items');

		if (notifications) {
			return notifications.some(function (item) {
				return item.getUnread();
			});
		}
		return this.getProperty('unread');
	};

	//================================================================================
	// Control methods
	//================================================================================

	NotificationListGroup.prototype.onBeforeRendering = function() {
		/** @type {sap.m.NotificationListItem[]} */
		var notifications = this.getItems();
		var notificationsCount = notifications.length;
		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		var expandText = resourceBundle.getText('NOTIFICATION_LIST_GROUP_EXPAND');
		var collapseText = resourceBundle.getText('NOTIFICATION_LIST_GROUP_COLLAPSE');
		var collapseButtonText = this.getCollapsed() ? expandText : collapseText;
		var collapseButton = this.getAggregation('_collapseButton');
		this._maxNumberOfNotifications = sap.ui.Device.system.desktop ? 400 : 100;
		this._maxNumberOfNotificationsTitle = resourceBundle.getText('NOTIFICATION_LIST_GROUP_MAX_NOTIFICATIONS_TITLE', notificationsCount - this._maxNumberOfNotifications);
		this._maxNumberOfNotificationsBody = resourceBundle.getText('NOTIFICATION_LIST_GROUP_MAX_NOTIFICATIONS_BODY');

		collapseButton.setText(collapseButtonText, true);
		collapseButton.setEnabled(this._getCollapseButtonEnabled(), true);

		this._maxNumberReached = notificationsCount > this._maxNumberOfNotifications;
	};

	NotificationListGroup.prototype.clone = function () {
		return NotificationListBase.prototype.clone.apply(this, arguments);
	};

	//================================================================================
	// Private and protected getters and setters
	//================================================================================

	/**
	 * Returns the sap.m.Title control used in the NotificationListGroup's title.
	 * @returns {sap.m.Text} The hidden title control aggregation used in the group title
	 * @private
	 */
	NotificationListGroup.prototype._getHeaderTitle = function () {
		/** @type {sap.m.Text} */
		var title = sap.m.NotificationListBase.prototype._getHeaderTitle.call(this);
		title.addStyleClass('sapMNLG-Title');

		if (this.getUnread()) {
			title.addStyleClass('sapMNLGTitleUnread');
		}

		return title;
	};

	/**
	 * Returns the sap.m.Text control used in the NotificationListGroup's datetime.
	 * @returns {sap.m.Text} The hidden text control aggregation used in the group's timestamp
	 * @private
	 */
	NotificationListGroup.prototype._getDateTimeText = function () {
		/** @type {sap.m.Text} */
		var dateTime = sap.m.NotificationListBase.prototype._getDateTimeText.call(this);
		dateTime.setTextAlign('End');

		return dateTime;
	};

	//================================================================================
	// Private and protected internal methods
	//================================================================================

	/**
	 * Toggles the NotificationListGroup state between collapsed/expanded.
	 * @private
	 */
	NotificationListGroup.prototype._toggleCollapsed = function () {
		/** @type {boolean} */
		var newCollapsedState = !this.getCollapsed();
		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		var expandText = resourceBundle.getText('NOTIFICATION_LIST_GROUP_EXPAND');
		var collapseText = resourceBundle.getText('NOTIFICATION_LIST_GROUP_COLLAPSE');

		this.getAggregation('_collapseButton').setText(newCollapsedState ? expandText : collapseText, true);

		this.$().toggleClass('sapMNLG-Collapsed', newCollapsedState);
		this.$().toggleClass('sapMNLG-NoNotifications', this._getVisibleItemsCount() <= 0);
	};

	/**
	 * Gets the number of visible NotificationListItems inside the group
	 * @returns {number} The number of visible notifications
	 * @private
	 */
	NotificationListGroup.prototype._getVisibleItemsCount = function () {
		/** @type [sap.m.NotificationListItem] */
		var items = this.getItems();
		var result = 0;

		items.forEach(function (item) {
			if (item.getVisible()) {
				result += 1;
			}
		});

		return result;
	};

	/**
	 * Gets what the state (enabled/disabled) of the collapse button should be
	 * @returns {boolean} Should the collapse button be enabled
	 * @private
	 */
	NotificationListGroup.prototype._getCollapseButtonEnabled = function () {
		if (this._getVisibleItemsCount() > 0) {
			return true;
		}

		return this.getEnableCollapseButtonWhenEmpty();
	};

	/**
	 * Compares two priorities and returns the higher one.
	 * @param {sap.ui.core.Priority} firstPriority First priority string to be compared
	 * @param {sap.ui.core.Priority} secondPriority Second priority string to be compared
	 * @returns {sap.ui.core.Priority} The highest priority
	 * @private
	 */
	function comparePriority(firstPriority, secondPriority) {
		if (firstPriority == secondPriority) {
			return firstPriority;
		}

		if ((firstPriority == 'None')) {
			return secondPriority;
		}

		if ((firstPriority == 'Low') && (secondPriority != 'None')) {
			return secondPriority;
		}

		if ((firstPriority == 'Medium') && (secondPriority != 'None' && secondPriority != 'Low')) {
			return secondPriority;
		}

		return firstPriority;
	}

	return NotificationListGroup;
}, /* bExport= */ true);
