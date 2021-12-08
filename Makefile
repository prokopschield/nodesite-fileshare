all:
	nsmt &
	yarn
	tsc
	node lib/build
