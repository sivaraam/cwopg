.PHONY: all categoryList articleList package_generator

all: categoryList articleList package_generator
	rm categoryList
	rm articleList
	@echo "Successfully generated the offline package!"

categoryList:
	rm -f categoryList
	make -C category_list_generator

articleList:
	rm -f articleList
	make -C article_list_generator

package_generator:
	make -C package_generator
