angular.module('PrivateBower')
    .controller('mainController', function($http) {
        var self = angular.extend(this, {
            packages: null,
            error: false,

            addPackageError: null,
            addPackageDialogOpened: false,
            addPackage: _addPackage,
            addPackageButtonClick: _addPackageButtonClick,
            cancelAddPackageClick: _cancelAddPackageClick,

            packageToRemove: null,
            removePackageError: null,
            removePackageDialogOpened: false,
            removePackage: _removePackage,
            removePackageButtonClick: _removePackageButtonClick,
            cancelRemovePackageClick: _cancelRemovePackageClick,
            
            togglePackageDetailsOpened: _togglePackageDetailsOpened
        });

        _init();
        function _init() {
            _getPackages();
        }

        function _getPackages() {
            $http.get('packages')
                .success(function(packages) {
                    let compare = function(v1, v2) {
                        const name1 = v1.name.toUpperCase();
                        const name2 = v2.name.toUpperCase();
                        let comparison = 0;
                        if (name1 > name2) {
                          comparison = 1;
                        } else if (name1 < name2) {
                          comparison = -1;
                        }
                        return comparison;
                    };
                    self.packages = packages.map(function(pack) {
                        pack.siteUrl = pack.url.replace('git://', 'https://');

                        return pack;
                    }).sort(compare);

                })
                .error(function(error) {
                    self.error = true;
                });
        }

        function _addPackageButtonClick() {
            self.addPackageDialogOpened = true;
        }

        function _cancelAddPackageClick() {
            self.addPackageDialogOpened = false;
        }

        function _addPackage(packageName, packageUrl) {
            $http.post('packages/' + packageName, {
                url: packageUrl
            })
                .success(function() {
                    self.addPackageDialogOpened = false;

                    _getPackages();
                })
                .error(function(error) {
                    self.addPackageError = error;
                });
        }

        function _removePackageButtonClick(packageName) {
            self.packageToRemove = packageName;

            self.removePackageDialogOpened = true;
        }

        function _cancelRemovePackageClick() {
            self.removePackageDialogOpened = false;
        }

        function _removePackage(packageName) {
            $http.delete('packages/' + packageName)
                .success(function() {
                    self.packageToRemove = null;
                    self.removePackageDialogOpened = false;

                    _getPackages();
                })
                .error(function(error) {
                    self.removePackageError = error;
                });
        }
        
        function _togglePackageDetailsOpened(bowerPackage) {
            bowerPackage.detailsOpened = !bowerPackage.detailsOpened;
            
            if(bowerPackage.detailsOpened && !bowerPackage.details) {
                loadPackageDetails(bowerPackage);
            }
            
            function loadPackageDetails(bowerPackage) {
                $http.get('packages/' + bowerPackage.name + '/details')
                    .success(function(details) {
                        bowerPackage.details = details;
                    })
                    .error(function() {
                        bowerPackage.detailsError = true;
                    })
            }
        }
    });