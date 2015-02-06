<?php
/*
 * Plugin Name: Kalimah Categories
 * Description: Improved categories view that let you manage categories easier than the standard Wordpress edit
 * Version: 1.0.0
 * Author: Abdul Al-Hasany
 * Text Domain: kalimahcategories
 * License: GPLv2 or later
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */


define('KALIMAHCATEGORIES_VERSION', '1.0');
define('KALIMAHCATEGORIES_DOMAIN', 'kalimahcategories');
define('KALIMAHCATEGORIES_BASE_URL', plugin_dir_url(__FILE__));
define('KALIMAHCATEGORIES_BASE_DIR_LONG', dirname(__FILE__));

include_once(KALIMAHCATEGORIES_BASE_DIR_LONG . "/list_walker.php");

/**
 * Register the plugin.
 *
 * Display the administration panel, insert JavaScript etc.
 */

class KalimahCategoriesPlugin
{
    /**
     * Constructor
     */
    public function __construct()
    {
        add_action('wp_ajax_add_edit_category', array(
            $this,
            'add_edit_category'
        ));
        
        add_action('wp_ajax_delete_category', array(
            $this,
            'delete_category'
        ));
		
		add_action('wp_ajax_update_categories', array(
            $this,
            'update_categories'
        ));
        
        add_action('admin_enqueue_scripts', array(
            $this,
            'backend_styles_scripts'
        ));
        
        /* Hook to admin_menu the yasr_add_pages function above */
        add_action('admin_menu', array(
            $this,
            'register_my_custom_menu_page'
        ));
		
		add_action( 'plugins_loaded', array( $this,'load_textdomain' ));
    }
    
	/**
	 * Load plugin textdomain.
	 *
	 * @since 1.0.0
	 */
	function load_textdomain() {
	  load_plugin_textdomain( "kalimahcategories", false, dirname( plugin_basename( __FILE__ ) )  . '/languages' ); 
	  
	}

    function register_my_custom_menu_page()
    {
        add_submenu_page('edit.php', __("Manage Categories", "kalimahcategories"),  __("Manage Categories", "kalimahcategories"), 'manage_options', 'kalimah-categories', array(
            $this,
            'display_page'
        ));
    }
    
    
    function backend_styles_scripts()
    {
        wp_register_script('functions', KALIMAHCATEGORIES_BASE_URL . '/resources/functions.js', array(
            'jquery'
        ));
		
		// Now we can localize the script with our data.
		$translation_array = array( 'icon_chevron' => (is_rtl()) ?'icon-chevron-left' : 'icon-chevron-right',
		'search_categories' => __("Search a category in ", "kalimahcategories") ,
		'edit_category' => __("Edit Category", "kalimahcategories"),
		'add_category' => __("Add Category", "kalimahcategories"),
		'confirm_delete' => __("Do you want to delete category?", "kalimahcategories"),
		'confirm_yes' => __("Yes", "kalimahcategories"),
		'confirm_no' => __("No", "kalimahcategories")
		);
		wp_localize_script( 'functions', 'functions_strings', $translation_array );



        wp_enqueue_script('functions');
        wp_enqueue_style('style', KALIMAHCATEGORIES_BASE_URL . 'resources/style.css', '');
		if(is_rtl())
			wp_enqueue_style('style-rtl', KALIMAHCATEGORIES_BASE_URL . 'resources/style-rtl.css', '');
        
		wp_enqueue_style('font-style', KALIMAHCATEGORIES_BASE_URL . 'resources/font-style.css', '');
    }
    
    function display_page()
    {
        $page = "<div id='kalimah-categories-page'>";
        $page .= "<div id='kalimah-categories-title'>";
        $page .= __("Categories", "kalimahcategories");
        $page .= "</div>";
        $page .= "<div id='kalimah-categories-header'>";
        $page .= "<ul class='navigation'>";
		$class = (is_rtl) ? "icon-arrow-left" : "icon-arrow-right";
        $page .= "<li class='back back-arrow $class'></li>";
        $page .= "<li class='nav-bit'>" . __("Main Page", "kalimahcategories") . "</li>";
        $page .= "</ul></div>";
        $page .= "<div id='kalimah-categories-content'>";
        $page .= "<div id='kalimah-categories-content-overlay'><span class='spinner_gray'></span></div>";
        $page .= "<div id='kalimah-categories-content-search'>";
        $page .= '<input type="text" name="search_categories" id="search_categories" placeholder="'.__("Search a category in the Main Page", "kalimahcategories").'">';
        $page .= "</div>";
        $page .= $this->get_categories();
        $page .= "</div>";
        $page .= "<div id='kalimah-categories-sidepanel'>";
        $page .= "<div id='kalimah-categories-sidepanel-overlay'><span class='close icon-close'></span><span class='text'></span><span class='spinner'></span></div>";
        $page .= $this->add_edit_category_form();
        $page .= "</div>";
        
        echo $page;
        
    }
    
	function update_categories()
	{
		echo $this->get_categories();
		die();
	}
	
    function get_categories()
    {
        $categories = "<ul class='categories_all_list'>";
        $cat_args   = array(
            'orderby' => 'name',
            "order" => "ASC",
            'title_li' => ' ',
            'walker' => new Categories_Walker(),
            "hide_empty" => 0,
            'echo' => 0
        );
        
        $categories .= wp_list_categories($cat_args);
        $categories .= "<li id='search_results'></li>";
        $categories .= "</ul>";
        
        return $categories;
    }
    
    function delete_category()
    {
        $result = wp_delete_category($_POST['catid']);
        if ($result)
            echo "true";
        else
            echo __("Category could not be deleted", "kalimahcategories");
        
        die();
    }
    
    function get_categories_dropdown($cat_id = 0)
    {
        $args = array(
            'show_option_none' => __('None', "kalimahcategories"),
            'orderby' => 'ID',
            'order' => 'ASC',
            'hide_empty' => 0,
            'echo' => 0,
            'selected' => $cat_id,
            'hierarchical' => 1,
            'name' => 'cat_parent',
            'id' => 'add_edit_catparent',
            'class' => 'postform'
        );
        return wp_dropdown_categories($args);
    }
    
    function add_edit_category_form()
    {
        $form .= "<h2 class='add_edit_title'>";
        $form .= __("Add Category", "kalimahcategories");
        $form .= "</h2>";
        
        $form .= "<div class='message'></div>";
        
        $form .= "<form class='add_edit_category'>";
        $form .= "<div class='title_section'>";
        $form .= __("Name", "kalimahcategories");
        $form .= "</div>";
        $form .= "<div class='input_section'>";
        $form .= '<input type="text" name="catname" id="add_edit_catname">';
        $form .= "</div>";
        $form .= "<div class='title_section'>";
        $form .= __("Slug", "kalimahcategories");
        $form .= "</div>";
        $form .= "<div class='input_section'>";
        $form .= '<input type="text" name="slug" id="add_edit_slug">';
        $form .= "</div>";
        $form .= "<div class='title_section'>";
        $form .= __("Parent", "kalimahcategories");
        $form .= "</div>";
        $form .= "<div class='input_section'>";
        $form .= $this->get_categories_dropdown();
        $form .= "</div>";
        $form .= "<div class='title_section'>";
        $form .= __("Description", "kalimahcategories");
        $form .= "</div>";
        $form .= "<div class='input_section'>";
        $form .= '<textarea rows="5" name="desc" id="add_edit_desc"></textarea>';
        $form .= "</div>";
        $form .= "<div class='title_section'>";
        $form .= '<input type="submit" value="'.__("Add New Category", "kalimahcategories").'" class="button button-primary" id="submit" name="submit">';
        $form .= "</div>";
        
        $form .= "</form>";
        
        return $form;
    }
    
    function add_edit_category()
    {
        $doaction      = $_POST['doaction'];
        $catid   = $_POST['catid'];
        $catname = $_POST['catname'];
        $desc    = $_POST['description'];
        $slug    = $_POST['slug'];
        $parent  = $_POST['parent'];

        if ($doaction == "insert") {
            $return = wp_insert_term($catname, 'category', array(
                'slug' => $slug,
                'description' => $desc,
                'parent' => $parent
            ));
            
            $result = array();
            if (is_wp_error($return)) {
                $result['error'] = $return->get_error_message();
            } else {
                $result['success'] = __("Category has been added", "kalimahcategories");
                $result['catid'] = $return['term_id'];
            }
        } else {
            $return = wp_update_term($catid, 'category', array(
                'name' => $catname,
                'slug' => $slug,
                'description' => $desc,
                'parent' => $parent
            ));
            
            $result = array();
            if (is_wp_error($return)) {
                $result['error'] = $return->get_error_message();
            } else {
                $result['success'] = __("Category has been edited", "kalimahcategories");
            }
		}
		echo json_encode($result);
        die();
    }
}

new  KalimahCategoriesPlugin();

?>