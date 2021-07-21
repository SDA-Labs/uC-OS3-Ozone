# Segger Ozone μC/OS-III Kernel Awareness



Enhancment to  [Segger Ozone](https://www.segger.com/products/development-tools/ozone-j-link-debugger/) allowing kernel awarness debugging for Micrium μC/OS-III.

## Table of Contents

1. [Project Status](#project-status)
1. [Getting Started](#getting-started)
    1. [Dependencies](#dependencies)
    1. [Building](#building)
    1. [Installation](#installation)
    1. [Usage](#usage)
1. [Release Process](#release-process)
    1. [Versioning](#versioning)
    1. [Payload](#payload)
1. [How to Get Help](#how-to-get-help)
1. [Further Reading](#further-reading)
1. [Contributing](#contributing)
1. [License](#license)
1. [Authors](#authors)
1. [Acknowledgements](#acknowledgements)


# Project Status

Plugin currently supports displaying information for the following

1. Task(s)
1. Timers(s)
1. Queue(s)
1. Mutex(s)
1. Semaphore(s)
1. Memory Partition(s)
1. Flag Group(s)
1. System Information


**[Back to top](#table-of-contents)**

# Getting Started

The following section will discuss the steps required to get started setting up Segger Ozone and how to install the μC/OS-III kernel awareness plugin. 

## Dependencies

A recent version of Segger Ozone is required for using μC/OS-III kernel awareness plugin. The latest version can be obtained directly from [Segger's website](https://www.segger.com/downloads/jlink/#Ozone). Select a version of Ozone compatible with your operating system.

## Getting the Source

Two methods are provided to obtain the kernel awareness plugin.

### Stable Release

The latest stable release can always be found on [GiHub Release](https://github.com/SDA-Labs/uC-OS3-Ozone/releases) page. Simply download and extract the zip to a location on your computer. 

### Development Version


The development version is [hosted on GitHub](https://github.com/SDA-Labs/uC-OS3-Ozone) and can be cloned directly using the following command:

```
git clone git@github.com:SDA-Labs/uC-OS3-Ozone.git
```

## Installation

To use μC/OS-III kernel awareness plugin within Segger Ozone, first Ozone must be installed followed by placing μC/OS-III kernel awareness plugin in a specific installation directly.

### Segger Ozone

After downloading Segger Ozone, follow the platform specific instructions for installing Ozone. 

### μC/OS-III Kernel Awareness Plugin

#### Windows
After Segger Ozone is installed,  μC/OS-III kernel awareness plugin can be installed. 

First close Segger Ozone if it is open. Next copy ```uC-OS3Plugin.js ``` from the extracted zip file or cloned repository to Ozone's OS plugin folder. For Microsoft Windows this is normally found at ```<USER INSTALL PATH>\SEGGER\Ozone\Plugins\OS```.

## Usage

### Enabling Kernel Awareness
Enabling kernel awareness debugging in Ozone requires first to load the plugin into Ozone, followed by enabling the plugin.
Start Segger Ozone and enter the following into the console

```
Project.SetOSPlugin("uC-OS3Plugin")
```

Then press enter. If successful the console will output something similar to the following
```
Project.SetOSPlugin ("uC-OS3Plugin");
File name resolved: "uC-OS3Plugin.js" was found at "<USER INSTALL PATH>/SEGGER/Ozone/Plugins/OS/uC-OS3Plugin.js"
RTOS awareness plugin loaded: <USER INSTALL PATH>/SEGGER/Ozone/Plugins/OS/uC-OS3Plugin.js.
```

Next to enable the plugin, select uC-OS3 under the view menu.
```
View > Advanced > uC/OS-III
```

Upon selecting uC/OS-III, Ozone will default to displaying the task list within kernel awareness window.

### Chang Displayed Data

μC/OS-III kernel awareness plugin is designed to show detailed information of the runtime performance of μC/OS-III when paused. Currently the following displays are supported

1. Task(s)
1. Timers(s)
1. Queue(s)
1. Mutex(s)
1. Semaphore(s)
1. Memory Partition(s)
1. Flag Group(s)
1. System Information

By default when activated only the task display will be shown. To enable additional displays, or remove a display, right click within the kernel awareness window and select one of the available options. If the option is enabled it will be disabled, otherwise the option will be enabled. 


**[Back to top](#table-of-contents)**

# Release Process

New releases will be made as bugs are fixed or new features are added. New releases will be tagged and made available through [GitHub](https://github.com/SDA-Labs/uC-OS3-Ozone/releases).


## Versioning

This project uses the following format for versioning

```
MAJOR.MINOR
```

MAJOR will be update after addition of a new feature or enhancement and MINOR will be updated after a bug fix. An update to MAJOR will always reset MINOR to 0. Available versions can be viewed at the [repository tag list](https://github.com/SDA-Labs/uC-OS3-Ozone/tags).


# How to Get Help

To request help, open a issue through [GitHub Issues](https://github.com/SDA-Labs/uC-OS3-Ozone/issues).

# Contributing

New enhancements, features, and bug reports should be reported using [GitHub Issues](https://github.com/SDA-Labs/uC-OS3-Ozone/issues). 

**[Back to top](#table-of-contents)**

# Further Reading

## Segger Ozone
* [Website](https://www.segger.com/products/development-tools/ozone-j-link-debugger/)
* [Download Software](https://www.segger.com/downloads/jlink/#Ozone)
* [User Manual](https://www.segger.com/downloads/jlink/UM08025_Ozone.pdf)


##  μC/OS-III
* [Firmware](https://github.com/weston-embedded/uC-OS3)
* [Documentation](https://micrium.atlassian.net/wiki/spaces/osiiidoc/overview)

## Miscellaneous
* [miscellaneous](https://mcuoneclipse.com/2016/10/15/freertos-kernel-awareness-with-ozone/)

**[Back to top](#table-of-contents)**

# License

Copyright (c) 2021 SDA Labs

This project is licensed under the MIT License - see [LICENSE.md](LICENSE.md) file for details.

**[Back to top](#table-of-contents)**

# Authors

* **[Sean Alling](https://github.com/oceanofthelost)** - *Initial work* - [SDA Labs](https://github.com/SDA-Labs)

**[Back to top](#table-of-contents)**