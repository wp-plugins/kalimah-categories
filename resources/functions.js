jQuery(document).ready(function() {
    speed = 300;
	
console.log(functions_strings);
	jQuery(window).scroll(function(e) {
		 jQuery("#kalimah-categories-sidepanel").css("margin-top", jQuery(window).scrollTop());
		});

    category_wrapper_function = function(e) {
        if (jQuery(this).siblings(".children").length > 0) {

            _this = jQuery(this);
			// First show main element (in case it is hidden by search results;
				jQuery(".categories").fadeIn();
                jQuery("#search_results").hide();
				
            jQuery(".categories_all_list .categories > ul:visible").fadeOut(function() {
                _this.siblings(".children").clone(true, true).hide().appendTo(".categories_all_list .categories").attr("data-id", _this.attr("data-id")).fadeIn();
            });

            jQuery(".back.back-arrow").addClass("active").attr("data-id", _this.attr("data-id"));

            // Add Nav bit
            jQuery("<li class='nav-bit "+functions_strings.icon_chevron +"'>" + _this.find(".category-title").first().text() + "</li>").hide().appendTo("#kalimah-categories-header .navigation").fadeIn().attr("data-id", _this.attr("data-id"));
			
			// change placeholder details
			jQuery("#search_categories").attr("placeholder", functions_strings.search_categories +" "+  _this.find(".category-title").first().text());
        }

        // Enable one more click after one second
        setTimeout(function() {
            jQuery(".categories_all_list").one('click', '.category-wrapper', category_wrapper_function);
        }, 1000);
    }

    /* Display list of available feeds on category click*/
    jQuery(".categories_all_list").one('click', '.category-wrapper', category_wrapper_function);

    jQuery("#kalimah-categories-header .navigation").on('click', '.back.active', function(e) {
        // Hide and remove shown categoires
        jQuery(".categories_all_list .categories > ul[data-id='" + jQuery(this).attr('data-id') + "']").fadeOut(function() {
            jQuery(this).remove();

            // check if it was the last category shown
            if (jQuery("#kalimah-categories-header .navigation li").length == 3) {
                jQuery(".back.back-arrow").removeClass("active").attr("data-id", "");
                jQuery(".categories_all_list .categories > ul").fadeIn();
            } else {
                // If there are more categoires fadeout then remove
                jQuery(".categories_all_list .categories > ul:last-child").fadeIn(function() {
                    jQuery(".back.active").attr("data-id", jQuery(".categories_all_list .categories > ul:last-child").attr("data-id"));
                });
            }
        })



        // Add Nav bit
        jQuery(".nav-bit[data-id='" + jQuery(this).attr('data-id') + "']").fadeOut(function() {
            jQuery(this).remove();
			jQuery("#search_categories").attr("placeholder", functions_strings.search_categories +" "+ jQuery("#kalimah-categories-header .navigation li:last-child").text());
        })

		
		
    });

    /* Show description */
    jQuery("#kalimah-categories-page").on('mouseover', '.category-overlay', function(e) {
        jQuery(".category-icons").stop().fadeOut("fast");
    });

    jQuery("#kalimah-categories-page").on('mouseover', '.parent-cat', function(e) {

        // Show only if there is description
        if (jQuery(this).find(".category-desc").first().html() != "") {
            jQuery(this).find(".category-desc").first().stop().animate({
                top: '80px'
            }, speed);
            jQuery(this).find(".category-info").first().stop().fadeOut(speed);
            jQuery(this).find(".category-top").first().stop().animate({
                'height': '80px'
            }, speed);
        }

        // Hide icons if category-overlay is showing
        if (jQuery(this).find(".category-overlay:visible").length == 0)
            jQuery(this).find(".category-icons").first().stop().fadeIn("fast");
    });

    jQuery("#kalimah-categories-page").on('mouseout', '.parent-cat', function(e) {
        if (jQuery(this).find(".category-desc").first().html() != "") {
            jQuery(this).find(".category-desc").first().stop().animate({
                top: '160px'
            }, speed);
            jQuery(this).find(".category-info").first().stop().fadeIn(speed);
            jQuery(this).find(".category-top").first().stop().animate({
                'height': '100px'
            }, speed);
        }
        jQuery(this).find(".category-icons").stop().fadeOut("fast");
    });

    jQuery(".add_edit_category").on('submit', function(event) {
        event.preventDefault();
        doaction = (jQuery("#kalimah-categories-sidepanel").hasClass("edit")) ? "edit" : "insert";
		catid = jQuery("#kalimah-categories-sidepanel").attr("data-id");

        data = {
            catid: catid,
            action: 'add_edit_category',
            doaction: doaction,
            catname: jQuery("#add_edit_catname").val(),
            slug: jQuery("#add_edit_slug").val(),
            description: jQuery("#add_edit_desc").val(),
            parent: jQuery("#add_edit_catparent").val(),
        };


        _this = jQuery(this);
        jQuery.ajax({
            data: data,
            url: ajaxurl,
            type: 'POST',
            timeout: 30000,
            beforeSend: function() {
                jQuery("#kalimah-categories-sidepanel-overlay .spinner").show();
                jQuery("#kalimah-categories-sidepanel-overlay").fadeIn("fast");
            },
            error: function(xhr, status, error) {
                jQuery("#kalimah-categories-sidepanel-overlay .spinner").hide();
                jQuery("#kalimah-categories-sidepanel-overlay .text").text(error);
                jQuery("#kalimah-categories-sidepanel-overlay").css('background-color', '#FF9494');
                jQuery('.close.icon-close').show();
            },
            success: function(sucessData) {
                jQuery("#kalimah-categories-sidepanel-overlay .spinner").hide();
                jQuery('.close.icon-close').show();

                result = JSON.parse(sucessData);

                // If action is successful show message
                if (result.success) {
                    // if success and it is to edit refelect changes back on original category
                    jQuery("#kalimah-categories-sidepanel-overlay .text").text(result.success);
                    jQuery("#kalimah-categories-sidepanel-overlay").css('background-color', '#339966');

					// Reflect changes on theme
					if(doaction == "edit")
					{
						jQuery(".parent-cat[data-id='" + jQuery("#kalimah-categories-sidepanel").attr("data-id") + "'] .category-title").text(jQuery("#add_edit_catname").val());
						jQuery(".parent-cat[data-id='" + jQuery("#kalimah-categories-sidepanel").attr("data-id") + "'] .category-slug").text(jQuery("#add_edit_slug").val());
						jQuery(".parent-cat[data-id='" + jQuery("#kalimah-categories-sidepanel").attr("data-id") + "'] .category-desc").text(jQuery("#add_edit_desc").val());
					}
					else
					{
						// Add category to view
						add_category_to_parent(result.catid, data);
					}
                } else {

                    jQuery("#kalimah-categories-sidepanel-overlay").css('background-color', '#FF9494');
                    jQuery("#kalimah-categories-sidepanel-overlay .text").text(result.error);
                }
            }
        }); //end get
    });

	function add_category_to_parent(catid, data)
	{
			
			desc = (!data.description) ? "" : data.description;
			console.log(data);
				$output = "<li \
						   class='parent-cat' data-slug='"+data.slug+"' \
						   data-id='"+catid+"' data-parentid='"+data.parent+"'> \
                <div class='category-wrapper' \
				 data-id='"+catid+"'> \
				<div class='category-overlay'> \
				<div class='confirm_box'> \
				<span class='confirm_title'>"+functions_strings.confirm_delete+"</span> \
				<span class='confirm_buttons'><span class='confirm_yes'>"+functions_strings.confirm_yes+"</span>\
				<span class='confirm_no'>"+functions_strings.confirm_no+"</span></span> \
				</div></div> \
                <div class='category-top'> \
                <div class='category-title'>"+data.catname+"</div> \
                </div> \
                <div class='category-desc'>"+desc+"</div> \
                <div class='category-info'> \
                <div class='category-slug' title='"+data.slug+"'>"+data.slug+"</div> \
                <div class='category-count'>0</div> \
                </div> \
                </div> \
				<div class='category-icons'> \
                <span class='delete icon-denied-outline'></span> \
                <span class='edit icon-page-edit'></span> \
                </div>";
			

		data = {
            action: 'update_categories',
        };

		
        jQuery.ajax({
            data: data,
            url: ajaxurl,
            type: 'POST',
            timeout: 30000,
            beforeSend: function() {
                jQuery("#kalimah-categories-content-overlay").fadeIn("fast");
            },
            error: function(xhr, status, error) {
            },
            success: function(sucessData) {
              jQuery("#kalimah-categories-content .categories_all_list").remove();
              jQuery(sucessData).appendTo(jQuery("#kalimah-categories-content"));
			  
			  jQuery("#kalimah-categories-content-overlay").fadeOut();
            }
        }); 
			
	}
	
	
    jQuery("#kalimah-categories-content").on('keyup', '#search_categories', function(event) {
        search_term = jQuery("#search_categories").val();
        if (search_term != "") {
            jQuery("#search_results").show();
            jQuery(".categories_all_list .categories").hide();
			
            search_results = jQuery(".categories_all_list .categories > ul:last-child > .parent-cat:contains('" + search_term + "')");
        
            if (search_results.length > 0) {
                jQuery("#search_results").html("");
                jQuery.each(search_results, function(i, e) {
                    jQuery(e).clone(true, true).appendTo("#search_results");
                })
            } else {
                jQuery("#search_results").html("<span class='no_results'>No result found</span>");
            }
        } else {

            jQuery("#search_results").hide();
            jQuery(".categories_all_list .categories").show();
        }
    })



    jQuery("#kalimah-categories-content").on('click', '.edit.icon-page-edit', function(event) {
		jQuery("#kalimah-categories-sidepanel-overlay").fadeOut("fast");
        title = jQuery(this).closest(".parent-cat").find(".category-title").first().text();
        desc = jQuery(this).closest(".parent-cat").find(".category-desc").first().text();
        slug = jQuery(this).closest(".parent-cat").find(".category-slug").first().text();
        parent = jQuery(this).closest(".parent-cat").attr("data-parentid");
        
        if (!(parent) || parent == 0)
            parent = -1;

        jQuery(".add_edit_title").text(functions_strings.edit_category);
        jQuery("#submit").val(functions_strings.edit_category);
        jQuery("#add_edit_catname").val(title);
        jQuery("#add_edit_slug").val(slug);
        jQuery("#add_edit_desc").val(desc);
        jQuery("#add_edit_catparent").val(parent);

        jQuery("#kalimah-categories-sidepanel").addClass("edit");
        jQuery("#kalimah-categories-sidepanel").attr("data-id", jQuery(this).closest(".parent-cat").attr("data-id"));
		
		
    });

    jQuery("#kalimah-categories-sidepanel-overlay").on('click', '.close.icon-close', function(e) {
        jQuery("#kalimah-categories-sidepanel-overlay").fadeOut("fast", function() {
            jQuery(this).css('background-color', 'gray');
            jQuery('.close.icon-close').hide();
            jQuery("#kalimah-categories-sidepanel-overlay .text").text("");
			
			// Reset back to add category
			jQuery("#improved-categories-sidepanel").removeClass("edit");
			jQuery(".add_edit_title").text(functions_strings.add_category);
			jQuery("#submit").val(functions_strings.add_category);
			
			jQuery("#add_edit_catname").val("");
			jQuery("#add_edit_slug").val("");
			jQuery("#add_edit_desc").val("");
			jQuery("#add_edit_catparent").val(0);
        });
    });

    jQuery(".categories_all_list").on('click', '.delete.icon-denied-outline', function(e) {
        jQuery(this).closest(".parent-cat").find(".category-overlay").first().fadeIn("fast");
        jQuery(this).closest(".category-icons").fadeOut("fast");
        jQuery(this).parent().stop().fadeOut("fast");
    })

    jQuery(".confirm_box").on('click', '.confirm_no', function(e) {
        jQuery(this).closest(".parent-cat").find(".category-overlay").first().fadeOut("fast");
    })

    jQuery(".confirm_box").on('click', '.confirm_yes', function(e) {
		
        _this = jQuery(this);
        data = {
            action: 'delete_category',
            catid: jQuery(this).closest(".parent-cat").attr("data-id")
        };

        jQuery.ajax({
            data: data,
            timeout: 30000,
            url: ajaxurl,
            type: 'POST',
            beforeSend: function() {
                _this.closest(".confirm_box").fadeOut("fast");
            },
           
            success: function(data) {
                if (data == "true") {
                    _this.closest(".category-wrapper").fadeOut(500, function() {
                        jQuery(this).parent().animate({
                            width: '0px'
                        }, {
                            duration: 1000,
                            complete: function() {
                                jQuery(this).remove();
                            }
                        })
                    })
                } else {
                    alert(data);
                    _this.closest(".parent-cat").find(".category-overlay").first().fadeOut("fast");
                }

                // empty form fields just in case
                jQuery("#add_edit_catname, #add_edit_slug, #add_edit_desc").val("");
            }
        }); //end get

    })



});