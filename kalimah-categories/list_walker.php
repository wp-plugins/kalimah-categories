<?php
class Categories_Walker extends Walker_Category
{
    function start_el(&$output, $category, $depth = 0, $args = array(), $id = 0)
    {
        extract($args);

        $cat_name = esc_attr($category->name);
        $slug     = urldecode($category->slug);
        $desc     = urldecode($category->description);
        $count     = $category->count;
        $cat_name = apply_filters('list_cats', $cat_name, $category);
       // $desc = apply_filters('list_cats', $desc, $category);
       // $slug = apply_filters('list_cats', $slug, $category);
        
        $link .= $cat_name;
        
		
        if ('list' == $args['style']) {
            $output .= "\t<li";
			
		//	$children_cat = get_term_children($category->term_id, "category");
         //  if (!empty($children_cat) OR $category->term_id == 1) {
                $output .= " class='parent-cat' data-slug='$slug'";
				$output .= " data-id='" . $category->term_id . "' data-parentid='" . $category->parent . "'>";
              
                $output .= "<div class='category-wrapper'";
				$output .= " data-id='" . $category->term_id . "'>";
				$output .= "<div class='category-overlay'>";
				$output .= "<div class='confirm_box'>";
				$output .= "<span class='confirm_title'>".__("Do you want to delete category?", "kalimahcategories")."</span>";
				$output .= "<span class='confirm_buttons'><span class='confirm_yes'>".__("Yes", "kalimahcategories")."</span><span class='confirm_no'>".__("No", "kalimahcategories")."</span></span>";
				$output .= "</div></div>";
                $output .= "<div class='category-top'>";
                $output .= "<div class='category-title'>$link</div>";
                $output .= "</div>";
                $output .= "<div class='category-desc'>$desc</div>";
                $output .= "<div class='category-info'>";
                $output .= "<div class='category-slug' title='$slug'>$slug</div>";
                $output .= "<div class='category-count'>$count</div>";
                $output .= "</div>";
                $output .= "</div>";
				$output .= "<div class='category-icons'>";
                $output .= "<span class='delete icon-denied-outline'></span>";
                $output .= "<span class='edit icon-page-edit'></span>";
                $output .= "</div>";
			
				
        } else {
            $output .= "\t$link<br />\n";
        }
    } // function start_el
    
} // class Custom_Walker_Category