/**
 * Module for displaying "Waiting for..." dialog using Bootstrap
 *
 * @author Eugene Maslovich <ehpc@em42.ru>
 * 18/07/2016 : Richard Hetherington Updated version forked from https://github.com/abdennour/bootstrap-waitingfor
 * Added modal-footer with close button and moved message to new div below progress bar so it can be updated more easily
 * Also modified message function to accept 2 parameters to allow title and message to be updated allowing greater flexibility
 * richard.hetherington@aztecretail.co.uk
 * 
 */

(function (root, factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		define(['jquery'], function ($) {
			return (root.waitingDialog = factory($));
		});
	}
	else {
		root.waitingDialog = root.waitingDialog || factory(root.jQuery);
	}

}(this, function ($) {
	'use strict';

	/**
	 * Dialog DOM constructor
	 */
	function constructDialog($dialog) {
		// Deleting previous incarnation of the dialog
		if ($dialog) {
			$dialog.remove();
		}
		return $(
			'<div class="modal fade" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-hidden="true" style="padding-top:15%; overflow-y:visible;">' +
				'<div class="modal-dialog modal-m">' +
					'<div class="modal-content">' +
						'<div class="modal-header" style="display:none;"></div>' +
						'<div class="modal-body">' +
							'<div class="progress progress-striped active">' +
								'<div class="progress-bar" style="width: 0%;"></div>' +
							'</div>' +
							'<div class="progress-message" style="display:none;"></div>' +
						'</div>' +
						'<div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div>' +
					'</div>' +
				'</div>' +
			'</div>'
		);
	}

	// Dialog object
	var $dialog,config,cache={};
        
	return {
		/**
		 * Opens our dialog
		 * @param message Custom message
		 * @param options Custom options:
		 *   options.headerText - if the option is set to boolean false, 
		 *     it will hide the header and "message" will be set in a paragraph above the progress bar.
		 *     When headerText is a not-empty string, "message" becomes a content 
		 *     above the progress bar and headerText string will be set as a text inside the H3;
		 *   options.headerSize - this will generate a heading corresponding to the size number. Like <h1>, <h2>, <h3> etc;
		 *   options.headerClass - extra class(es) for the header tag;
		 *   options.dialogSize - bootstrap postfix for dialog size, e.g. "sm", "m";
		 *   options.progressType - bootstrap postfix for progress bar type, e.g. "success", "warning";
		 *   options.contentElement - determines the tag of the content element. 
		 *     Defaults to "p", which will generate a <p> tag;
		 *   options.contentClass - extra class(es) for the content tag.
		 */
		show: function (message, options) {
			// Assigning defaults
			if (typeof options === 'undefined') {
				options = {};
			}
			if (typeof message === 'undefined') {
				message = 'Loading';
			}
			var settings = $.extend({
				headerText: '',
				headerSize: 3,
				headerClass: '',
				dialogSize: 'm',
				progressType: '',
				contentElement: 'p',
				contentClass: 'content',
				rtl:true,
				timer:500, //useful for animate function
				timeout:0,//useful for animate function
				onHide: null // This callback runs after the dialog was hidden
			}, options),
			$headerTag, $contentTag;
                        config=  settings;
			$dialog = constructDialog($dialog);

			// Configuring dialog
			$dialog.find('.modal-dialog').attr('class', 'modal-dialog').addClass('modal-' + settings.dialogSize);
			$dialog.find('.progress-bar').attr('class', 'progress-bar');
			if (settings.progressType) {
				$dialog.find('.progress-bar').addClass('progress-bar-' + settings.progressType);
			}
                       if(settings.rtl){
                       	      $dialog.find('.progress-bar').css('float','right').end().attr('dir','rtl')
                       }
			// Generate header tag
			$headerTag = $('<h' + settings.headerSize + ' />');
			$headerTag.css({ 'margin': 0 });
			if (settings.headerClass) {
				$headerTag.addClass(settings.headerClass);
			}

			// Generate content tag
			$contentTag = $('<' + settings.contentElement + ' />');
			if (settings.contentClass) {
				$contentTag.addClass(settings.contentClass);
			}

			if (settings.headerText === false) {
				$contentTag.html(message);
				$dialog.find('.progress-message').html($contentTag).show();
			}
			else if (settings.headerText) {
				$headerTag.html(settings.headerText);
				$dialog.find('.modal-header').html($headerTag).show();

				$contentTag.html(message);
				$dialog.find('.progress-message').html($contentTag).show();
			}
			else {
				$headerTag.html(message);
				$dialog.find('.modal-header').html($headerTag).show();
			}

			// Adding callbacks
			if (typeof settings.onHide === 'function') {
				$dialog.off('hidden.bs.modal').on('hidden.bs.modal', function () {
					settings.onHide.call($dialog);
				});
			}
			// Opening dialog
			$dialog.modal();
		},
		/**
		 * Closes dialog
		 */
		hide: function () {
			if (typeof $dialog !== 'undefined') {
				$dialog.modal('hide');
			}
		},
		/**
		 * Changes or displays current dialog message
		 * @author Abdennour TOUMI <abdennour.toumi@gmail.com>
		 * 18/07/2016 : Richard Hetherington modified to allow both message and header to be updated with title only be updated if supplied
		 * I don't see why you would need to return the values as they can be stored before updating dialog in calling function ?? 
		 */
		message: function (newMessage, newTitle) {
			if (typeof $dialog !== 'undefined') {
				if (typeof newTitle !== 'undefined') {
					$dialog.find('.modal-header>h'+config.headerSize).html(newTitle).show();										
				}
				if (typeof newMessage !== 'undefined') {
					$dialog.find('.progress-message').html(newMessage).show();
				}
			}
		}
		/**
		 * animate the  message every period equals to 'timer',
		 * and starts this animation after a delay equals to 'timeout'
		 * 
		 * 
		 * @param messages can be  : 
		 *      - string : it will be an array , i.e: messages="waitings"--> messages=["waiting..","waiting....",""waiting"......"]
		 *      - array 
		 *      - function 
		 * @param timer period
		 * @param timeout if it is 0 -> starts immediatly
		 * 
		 * @return id of periodic job
		 * @author Abdennour TOUMI <abdennour.toumi@gmail.com>
		 * */
		,animate:function(messages,timer,timeout){
			timer=timer ||config.timer;
			timeout=timeout||config.timeout;
			
			messages=messages||$dialog.find('.modal-header>h'+config.headerSize).html();
			cache.animate=cache.animate || [];
			if(typeof messages ==='string'){
			     	
			   	
			     messages=['..','....','......'].map(function(e){
			     	return messages+e;
			     })	;
			}
			
			if(typeof messages ==='object' && messages instanceof Array){
				var old=messages;
				messages=function(container){
					var current=old.indexOf(container.html());
					if(current<0){
						container.html(old[0]);
					}else{
					      var indx=(current+1>=old.length)?0:current+1	
					       container.html(old[indx]);	
						
					}
				}
				
			}
		
			if(typeof messages ==="function"){
				if(timeout<timer){
				        setTimeout(function(){
					     messages.call($dialog,$dialog.find('.modal-header>h'+config.headerSize))
				        },timeout)
			        }
				var job= setInterval(function(){
					messages.call($dialog,$dialog.find('.modal-header>h'+config.headerSize))
				},timer);
				cache.animate.push(job);
				return job;
			}
			
			
			
		},
		/**
		* stop job with specified id .
		   if no id specified , stopAnimate will stop the last running job . 
		*@param id
		* @author Abdennour TOUMI <abdennour.toumi@gmail.com>
		*/
		 
		stopAnimate:function(id){
			 id=id || cache.animate[cache.animate.length-1];
			 clearInterval(id);
			 delete cache.animate[cache.animate.indexOf(id)];
			return $dialog;
		},
		/**
		* @param percentOrCurrent
		* @param total
		* Calling with : 
		*   - No Arguement --> get the current progress
		*   - One Argument --> "percentOrCurrent" is the percent of progress
		*   - Two Argument ---> "percentOrCurrent" is the current amount, "total" is the total amount . 
		*@author Abdennour TOUMI <abdennour.toumi@gmail.com>
		*/
		progress:function(percentOrCurrent,total){
			if(!arguments.length){
				return parseInt($dialog.find('.progress-bar')[0].style.width);
			}
			if(total){
				percentOrCurrent=parseInt(percentOrCurrent/total*100);
			}
			$dialog.find('.progress-bar').css('width',percentOrCurrent+'%').text( percentOrCurrent + ' Complete' );
			return $dialog;
		}		
	};

}));
