/**
 * Copyright (c) 2022
 *
 * Logging Module
 *
 * @summary Provides logging
 * @author Justin Scott
 *
 * Created at     : 2022-04-10
 * Last modified  : 2022-04-10
 */

require ('source-map-support').install();

///////////////////////////////////////////////////////////////////////////////
/// IMPORTS
///////////////////////////////////////////////////////////////////////////////

import path from 'path';

///////////////////////////////////////////////////////////////////////////////
/// ENUMS
///////////////////////////////////////////////////////////////////////////////

export enum LoggingLevel
{
    ERROR,
    WARN,
    INFO,
    DEBUG,
    VERBOSE
}

///////////////////////////////////////////////////////////////////////////////
/// LOCAL FUNCTIONS
///////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////
/// Gets the stack trace for a method call. Used in getting the line number and
/// file name
//////////////////////////////////////////////////////////////////////////////
function stackTrace(): any
{
    const orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) {
        return stack;
    };
    const err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    const stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
}


///////////////////////////////////////////////////////////////////////////////
/// EXPORTED CLASSES
///////////////////////////////////////////////////////////////////////////////

export default class Logger
{
    private static  _errors: number;
    private static _warnings: number;
    private static _startTime: Date;
    private static _loggingLevel: LoggingLevel;

    //////////////////////////////////////////////////////////////////////////////
    /// Initializes logging class. Prints initial starting messages and sets variables
    ///
    /// @param[in] loggingLevel     LoggingLevel to use (INFO recommended in Production)
    ///                             Allowed Values:
    ///                             ERROR
    ///                             WARN
    ///                             INFO
    ///                             DEBUG
    ///                             VERBOSE
    /// @param[in] productName      Name of the product
    /// @param[in] productVersion   Version of product
    //////////////////////////////////////////////////////////////////////////////
    static init (loggingLevel: string | LoggingLevel, productName: string, productVersion: string)
    {
        this._errors            = 0;
        this._warnings          = 0;
        this._startTime         = new Date(Date.now ());

        if ("string" === typeof loggingLevel)
        {
            switch (loggingLevel.toUpperCase ())
            {
                case "ERROR":
                {
                    this._loggingLevel = LoggingLevel.ERROR;
                    break;
                }
                case "WARN":
                {
                    this._loggingLevel = LoggingLevel.WARN;
                    break;
                }
                case "INFO":
                {
                    this._loggingLevel = LoggingLevel.INFO;
                    break;
                }
                case "DEBUG":
                {
                    this._loggingLevel = LoggingLevel.DEBUG;
                    break;
                }
                case "VERBOSE":
                {
                    this._loggingLevel = LoggingLevel.VERBOSE;
                    break;
                }
                default:
                {
                    this._loggingLevel = LoggingLevel.INFO;
                }
            }
        }
        else if (loggingLevel)
        {
            this._loggingLevel = loggingLevel;
        }
        else
        {
            this._loggingLevel = LoggingLevel.INFO;
        }

        console.info (`${productName} v${productVersion}`);
        console.info (`Copyright © ${(new Date).getFullYear ()}`);
        console.info ("");
        console.info (`Started application at ${this._startTime.toISOString()}`);
        console.info ("");
    }

    //////////////////////////////////////////////////////////////////////////////
    /// Get Logging Level
    ///
    /// @returns Logging level
    //////////////////////////////////////////////////////////////////////////////
    static get loggingLevel (): LoggingLevel
    {
        return this._loggingLevel;
    }

    //////////////////////////////////////////////////////////////////////////////
    /// Set Logging Level
    ///
    /// @param[in] New logging level to set to
    //////////////////////////////////////////////////////////////////////////////
    static set loggingLevel (loggingLevel: LoggingLevel)
    {
        this._loggingLevel = loggingLevel;
    }

    //////////////////////////////////////////////////////////////////////////////
    /// Info Log. Logs info. Should be called on login, logout, failed login and
    /// database modification/deletion. Pass in req object to record username and IP
    /// address.
    ///
    /// @param[in] message  Message to log
    /// @param[in] req      Request object. Parses username and IP address
    //////////////////////////////////////////////////////////////////////////////
    static info (message: string, ip: string = null, username: string = null)
    {
        if (this._loggingLevel >= LoggingLevel.INFO)
        {
            if (null === ip)
            {
                console.info (`INFO: ${new Date(Date.now ()).toISOString()} - ${stackTrace ()[1].getLineNumber ()}@${path.basename(stackTrace ()[1].getFileName ())}: ${message}`);
            }
            else
            {
                console.info (`INFO: ${new Date(Date.now ()).toISOString()} - ${username ? username : "Unauthenticated"}@${ip}: ${message}`);
            }
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    /// Error log. Used for debugging. Records file name and line number with error
    ///
    /// @param[in]  message     Error message to log
    //////////////////////////////////////////////////////////////////////////////
    static error (message: string)
    {
        console.error (`ERROR: ${new Date(Date.now ()).toISOString()} - ${stackTrace ()[1].getLineNumber ()}@${path.basename(stackTrace ()[1].getFileName ())}: ${message}`);
        this._errors++;
    }

    //////////////////////////////////////////////////////////////////////////////
    /// Warning log. Used for debugging. Records file name and line number with waning
    ///
    /// @param[in]  message     Warning message to log
    //////////////////////////////////////////////////////////////////////////////
    static warn (message: string)
    {
        if (this._loggingLevel >= LoggingLevel.WARN)
        {
            console.warn (`WARN: ${new Date(Date.now ()).toISOString()} - ${stackTrace ()[1].getLineNumber ()}@${path.basename(stackTrace ()[1].getFileName ())}: ${message}`);
        }

        this._warnings++;
    }


    //////////////////////////////////////////////////////////////////////////////
    /// Debug log. Used for debugging. Records file name and line number with waning
    ///
    /// @param[in]  message     Debug message to log
    //////////////////////////////////////////////////////////////////////////////
    static debug (message: string)
    {
        if (this._loggingLevel >= LoggingLevel.DEBUG)
        {
            console.debug (`DEBUG: ${new Date(Date.now ()).toISOString()} - ${stackTrace ()[1].getLineNumber ()}@${path.basename(stackTrace ()[1].getFileName ())}: ${message}`);
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    /// Verbose log. Used for debugging. Records file name and line number with waning
    ///
    /// @param[in]  message     Verbose message to log
    //////////////////////////////////////////////////////////////////////////////
    static verbose (message: string)
    {
        if (this._loggingLevel >= LoggingLevel.VERBOSE)
        {
            console.debug (`VERBOSE: ${new Date(Date.now ()).toISOString()} - ${stackTrace ()[1].getLineNumber ()}@${path.basename(stackTrace ()[1].getFileName ())}: ${message}`);
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    /// To be called when application exits. Record log stats and exit code.
    ///
    /// @param[in]  Code    Application exit code
    //////////////////////////////////////////////////////////////////////////////
    static uninit (code)
    {
        console.info ("");
        console.info (`Application exited with code ${code}`);
        console.info ("");
        console.info (`Application Started: ${this._startTime.toISOString ()}`);
        console.info (`Application ended:   ${new Date(Date.now ()).toISOString ()}`);
        console.info (`Application uptime:  ${Math.round(Math.abs(new Date(Date.now ()).getTime () - this._startTime.getTime ()) / 36e5)} Hours`);
        console.info (`Total Warnings:      ${this._warnings}`);
        console.info (`Total errors:        ${this._errors}`);
        console.info ("");
    }
}