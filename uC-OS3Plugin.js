/*
    https://www.segger.com/downloads/embos/UM01025_embOS_IAR_Plugin
*/
/*********************************************************************
*
*       Defines
*
**********************************************************************
*/

/**** Configurable **************************************************/
var StackCheckLimit = 8192;

/**** ARM Register indices, constant ********************************/
var arm_r0  =  0;
var arm_r1  =  1;
var arm_r2  =  2;
var arm_r3  =  3;
var arm_r4  =  4;
var arm_r5  =  5;
var arm_r6  =  6;
var arm_r7  =  7;
var arm_r8  =  8;
var arm_r9  =  9;
var arm_r10 = 10;
var arm_r11 = 11;
var arm_r12 = 12;
var arm_sp  = 13;
var arm_lr  = 14;
var arm_pc  = 15;
var arm_psr = 16;





var window_Timers              = "Timers";
var window_Queues              = "Queues";
var window_Mutexes             = "Mutexes";
var window_Semaphores          = "Semaphores";
var window_MemoryPartitions    = "Memory Partitions";
var window_FlagGroups          = "Flag Groups";
var window_SystemInformation   = "System Information";



/**** Object Type*************** ************************************/
var OBJECT_TYPE_TASK              = 0;
var OBJECT_TYPE_TIMER             = 1;
var OBJECT_TYPE_QUEUE             = 2;
var OBJECT_TYPE_MUTEX             = 3;
var OBJECT_TYPE_SEMAPHORE         = 4;
var OBJECT_TYPE_MEMORY_PARTITION  = 5;
var OBJECT_TYPE_FLAG_GROUP        = 6;



/*********************************************************************
*
*       Local functions
*
**********************************************************************
*/
function GetObjectName(objectType, address)
{
    var Name;

    switch(objectType)
    {
        case OBJECT_TYPE_TASK:
            Name = Debug.evaluate("(char*)(*(OS_TCB*)" + address + ").NamePtr");
            break;
        case OBJECT_TYPE_TIMER:
            Name = Debug.evaluate("(char*)(*(OS_TMR*)" + address + ").NamePtr");
            break;
        case OBJECT_TYPE_QUEUE:
            Name = Debug.evaluate("(char*)(*(OS_Q*)" + address + ").NamePtr");
            break;
        case OBJECT_TYPE_MUTEX:
            Name = Debug.evaluate("(char*)(*(OS_MUTEX*)" + address + ").NamePtr");
            break;
        case OBJECT_TYPE_SEMAPHORE:
            Name = Debug.evaluate("(char*)(*(OS_SEM*)" + address + ").NamePtr");
            break;
        case OBJECT_TYPE_MEMORY_PARTITION:
            Name = Debug.evaluate("(char*)(*(OS_MEM*)" + address + ").NamePtr");
            break;
        case OBJECT_TYPE_FLAG_GROUP:
            Name = Debug.evaluate("(char*)(*(OS_FLAG_GRP*)" + address + ").NamePtr");
            break;
        case OBJECT_TYPE_PEND:
            Name = Debug.evaluate("(char*)(*(os_pend_obj*)" + address + ").NamePtr");
            break;
        default:
            Name = undefined;
            break;
    }

    if (Name == undefined)
    {
        Name = "n.a.";
    }
    else if (Name == 0)
    {
        Name = "";
    }
    return Name;
}

function GetUtilizationString(arg1, arg2)
{
    var sUtilization;
    // Format is "USED/MAX (Percent %)"
    return arg1 + " / " + arg2 +" (" + ((arg1*100)/arg2).toFixed(2) +"%)";
}

function GetFuctionAddressAndNameString(address)
{
    if(address == undefined)
    {
        return  "n.a.";
    }
    else
    {
        return  "0x" + address.toString(16).toUpperCase() + " (" + Debug.getfunction(address) + ")";
    }
}

function GetTaskState(task)
{
    var WaitObj;
    var sName;
    var sText;

    //
    // Retrieve waiting object name if available
    //
    WaitObj = Debug.evaluate("((OS_PEND_OBJ*)" + task.PendObjPtr + ")");
    sName   = GetObjectName(OBJECT_TYPE_PEND, WaitObj);


    sText   = (WaitObj) ? (" 0x" + WaitObj.toString(16).toUpperCase()) : "";
    if (sName != "")
    {
        sText += " (" + sName + ")";
    }

    switch(task.TaskState)
    {
        case 0:
            return "Ready";
        case 1:
            return "Timeout";
        case 2:
            return "Pend" + sText;
        case 3:
            return "Pend + Timeout" + sText;
        case 4:
            return "Suspend";
        case 5:
            return "Suspend + Timeout";
        case 6:
            return "Suspend + Pend";
        case 7:
            return "Suspend + Pend + Timeout";
        case 255:
            return "Delete";
        default:
            return "Invalid";
    }
}

function GetTimerState(timer)
{

    switch(timer.State)
    {
        case 1:
            return "Stopped"
        case 2:
            return "Running"
        case 3:
            return "Completed"
        case 4:
            return "Timeout"
        default:
            return "Unused";
    }
}

function GetTimeoutInSystemTicks(arg1)
{
    var systemTimeTaskTimeout;
    systemTimeTaskTimeout = (arg1 != 0) ? Debug.evaluate("OSTickCtr") + arg1 : 0;

    return (arg1 + "(" + systemTimeTaskTimeout +")");
}

function GetTaskPendOn(pendOn)
{
    var resultString;

    switch(pendOn)
    {
        case 0:
            resultString = "Nothing"
            break;
        case 1:
            resultString = "Flag"
            break;
        case 2:
            resultString = "Task Queue"
            break;
        case 3:
            resultString = "Condition Variable"
            break;
        case 4:
            resultString = "Mutex"
            break;
        case 5:
            resultString = "Queue"
            break;
        case 6:
            resultString = "Semaphore"
            break;
        case 7:
            resultString = "Task Semaphore"
            break;
        default:
            resultString = "";
    }

    return resultString;
}

function GetTaskPendStatus(pendStatus)
{
    var resultString;

    switch(pendStatus)
    {
        case 0:
            resultString = "OK"
            break;
        case 1:
            resultString = "Abort"
            break;
        case 2:
            resultString = "Deleted"
            break;
        case 3:
            resultString = "Timed Out"
            break;
        default:
            resultString = "";
    }

    return resultString;
}

function UpdateTasks(Window)
{
    var pTask;
    var pCurrentTask;
    var OS_TCB;


    var task_Id;
    var task_Priority;
    var task_TaskName;
    var task_CPUUsage;
    var task_State;
    var task_PendingOn;
    var task_PendingStatus;
    var task_Timeout;
    var task_Stack;
    var task_StackUtilization;
    var task_RunCount;
    var task_TimeSlice;
    var task_TaskEvents;
    var task_Opt;

    // Retrieve start of linked task list from target
    //
    pTask        = Debug.evaluate("OSTaskDbgListPtr");
    pCurrentTask = Debug.evaluate("OSTCBCurPtr");

    // 
    // Iterate through linked list of tasks and create an entry to the queue for each
    //
    while ((pTask != 0) && (pTask != undefined))
    {
        OS_TCB = Debug.evaluate("*(OS_TCB*)" + pTask);

        task_Id               ="0x" + pTask.toString(16).toUpperCase();
        task_Priority         = OS_TCB.Prio;
        task_TaskName         = GetObjectName(OBJECT_TYPE_TASK, pTask);
        task_CPUUsage         = (OS_TCB.CPUUsage/100).toString() + '%';
        task_State            = (pTask == pCurrentTask) ? "Executing" : GetTaskState(OS_TCB);
        task_PendingOn        = GetTaskPendOn(OS_TCB.PendOn);
        task_PendingStatus    = GetTaskPendStatus(OS_TCB.PendStatus);
        task_Timeout          = GetTimeoutInSystemTicks(OS_TCB.TickRemain);
        task_Stack            = "0x" + OS_TCB.StkBasePtr.toString(16).toUpperCase();
        task_StackUtilization = GetUtilizationString(OS_TCB.StkUsed, OS_TCB.StkSize);
        task_RunCount         = OS_TCB.CtxSwCtr;
        task_TimeSlice        = OS_TCB.TimeQuantaCtr + "/" + OS_TCB.TimeQuanta;
        task_TaskEvents       = "";
        task_Opt              = "0x" + OS_TCB.Opt.toString(16).toUpperCase();


        // "Id", "Priority", "Name", "CPU Usage", "State", "Pend On", "Pend Status", "Timeout", "Stack", "Stack Utilization", "Run Count", "Time Slice", "Options", "Task Events"
        Window.add(  task_Id,
                     task_Priority,
                     task_TaskName,
                     task_CPUUsage,
                     task_State,
                     task_PendingOn,
                     task_PendingStatus,
                     task_Timeout,
                     task_Stack,
                     task_StackUtilization,
                     task_RunCount,
                     task_TimeSlice,
                     task_Opt,
                     task_TaskEvents,

                     // Must be last. Used for proper operation of task aware register display.
                     (pTask == pCurrentTask) ? undefined : pTask
                 );
        pTask = OS_TCB.DbgNextPtr;
    }
}

function UpdateTimers(Window)
{
    var pTimer;
    var OS_TMR;

    var timer_ID;
    var timer_Name;
    var timer_CallbackName;
    var timer_Hook;
    var timer_Timeout;
    var timer_Period;
    var timer_State;
    var timer_Opt;


    pTimer = Debug.evaluate("OSTmrDbgListPtr")

    while ((pTimer != 0) && (pTimer != undefined))
    {
        OS_TMR = Debug.evaluate("*(OS_TMR*)" + pTimer);

        timer_ID               = "0x" + pTimer.toString(16).toUpperCase();
        timer_Name             = GetObjectName(OBJECT_TYPE_TIMER, pTimer);
        timer_Callback         = GetFuctionAddressAndNameString(OS_TMR.CallbackPtr);
        timer_Delay            = OS_TMR.Dly;

        systemTimeTimerTimeout = (OS_TMR.Remain != 0) ? Debug.evaluate("OSTickCtr") + OS_TMR.Remain : 0;
        timer_Timeout          = OS_TMR.Remain + " (" + systemTimeTimerTimeout +")";
        timer_Period           = OS_TMR.Period;
        timer_State            = GetTimerState(OS_TMR);
        timer_Opt              = "0x" + OS_TMR.Opt.toString(16).toUpperCase();

        // Update information in the plug in window
        // "Id" , "Name", "Callback", "Delay", "Timeout"    , "Period", "State", "Option"
        Window.add2(  window_Timers,
                      timer_ID,
                      timer_Name,
                      timer_Callback,
                      timer_Delay,
                      timer_Timeout,
                      timer_Period,
                      timer_State,
                      timer_Opt
                  );

        pTimer = OS_TMR.DbgNextPtr;
    }
}

function UpdateQueues(Window)
{
    var pQueue;
    var OS_Q;

    var queue_ID;
    var queue_Name;
    var queue_BufferAddress;
    var queue_Utilization;
    var queue_PeakUtilization;


    pQueue = Debug.evaluate("OSQDbgListPtr")

    while ((pQueue != 0) && (pQueue != undefined))
    {
        OS_Q = Debug.evaluate("*(OS_Q*)" + pQueue);

        queue_ID                = "0x" + pQueue.toString(16).toUpperCase();
        queue_Name              = GetObjectName(OBJECT_TYPE_QUEUE, pQueue);
        queue_BufferAddress     = "0x" + OS_Q.MsgQ.toString(16).toUpperCase()
        buffer_Utilization      = GetUtilizationString(OS_Q.MsgQ.NbrEntries, OS_Q.MsgQ.NbrEntriesSize)
        buffer_PeakUtilization  = GetUtilizationString(OS_Q.MsgQ.NbrEntriesMax, OS_Q.MsgQ.NbrEntriesSize)

        // Update information in the plug in window
        // "Id" , "Name", "Buffer"  , "Utilization", "Peak Utilization"
        Window.add2(  window_Queues,
                      queue_Id,
                      queue_Name,
                      queue_BufferAddress,
                      queue_Utilization,
                      queue_PeakUtilization
                  );

        pQueue = OS_Q.DbgNextPtr;
    }            
}

function UpdateMutexes(Window)
{
    var pMutex;
    var OS_MUTEX;

    var mutex_ID;
    var mutex_Name;
    var mutex_Owner;
    var mutex_UseCounter;
    var mutex_LastReleased;
    var mutex_WaitingTasks;


    pMutex = Debug.evaluate("OSMutexDbgListPtr")

    while ((pMutex != 0) && (pMutex != undefined))
    {
        OS_MUTEX = Debug.evaluate("*(OS_MUTEX*)" + pMutex);

        mutex_ID           = "0x" + pMutex.toString(16).toUpperCase();
        mutex_Name         = GetObjectName(OBJECT_TYPE_MUTEX, pMutex);
        mutex_Owner        = GetObjectName(OBJECT_TYPE_TASK, pMutex.OwnerTCBPtr);
        mutex_UseCounter   = OS_MUTEX.OwnerNestingCtr;
        mutex_LastReleased = OS_MUTEX.TS;
        mutex_WaitingTasks = "";

        // Update information in the plug in window
        // "Id" , "Name", "Owner   ", "Use Counter", "Last Released", Waiting Tasks"
        Window.add2( window_Mutexes,
                     mutex_ID,
                     mutex_Name,
                     mutex_Owner,
                     mutex_UseCounter,
                     mutex_LastReleased,
                     mutex_WaitingTasks
                  );

        pMutex = OS_MUTEX.DbgNextPtr;
    }
}

function UpdateSemaphores(Window)
{
    var pSemaphore;
    var OS_SEM;

    var semaphore_ID;
    var semaphore_Name;
    var semaphore_UseCounter;
    var semaphore_WaitingTasks;
    var semaphore_LastTimePosted;

    pSemaphore = Debug.evaluate("OSSemDbgListPtr");

    while ((pSemaphore != 0) && (pSemaphore != undefined))
    {
        OS_SEM = Debug.evaluate("*(OS_SEM*)" + pSemaphore);

        semaphore_ID             = "0x" + pSemaphore.toString(16).toUpperCase();
        semaphore_Name           = GetObjectName(OBJECT_TYPE_SEMAPHORE, pSemaphore);
        semaphore_UseCounter     = OS_SEM.Ctr;
        semaphore_LastTimePosted = OS_SEM.TS;
        semaphore_WaitingTasks   = "";

        // Update information in the plug in window
        // "Id" , "Name", "Count", "Last Posted", "Waiting Tasks"
        Window.add2( window_Semaphores,
                     semaphore_ID,
                     semaphore_Name,
                     semaphore_UseCounter,
                     semaphore_LastTimePosted,
                     semaphore_WaitingTasks
                  );

        pSemaphore = OS_SEM.DbgNextPtr;
    }
}

function UpdateMemoryPartitions(Window)
{
    var pMem;
    var OS_MEM;

    var memoryPartition_ID;
    var memoryPartition_Name;
    var memoryPartition_BlockSize;
    var memoryPartition_Usage;
    var memoryPartition_BufferAddress;
    var memoryPartition_WaitingTasks;


    pMem = Debug.evaluate("OSMemDbgListPtr");

    while ((pMem != 0) && (pMem != undefined))
    {
        OS_MEM = Debug.evaluate("*(OS_MEM*)" + pMem);

        memoryPartition_ID            = "0x" + pMem.toString(16).toUpperCase();
        memoryPartition_Name          = GetObjectName(OBJECT_TYPE_MEMORY_PARTITION, pMem);
        memoryPartition_BlockSize     = OS_MEM.BlkSize;
        memoryPartition_Usage         = GetUtilizationString(OS_MEM.NbrMax-OS_MEM.NbrFree, OS_MEM.NbrMax);
        memoryPartition_BufferAddress = "0x" + OS_MEM.AddrPtr.toString(16).toUpperCase();
        memoryPartition_WaitingTasks  = ""

        // Update information in the plug in window
        // "Id",  "Name", "Buffer"  , "Utilization", "Block Size", "Waiting Tasks"
        Window.add2( window_MemoryPartitions,
                     memoryPartition_ID,
                     memoryPartition_Name,
                     memoryPartition_BufferAddress,
                     memoryPartition_Usage,
                     memoryPartition_BlockSize,
                     memoryPartition_WaitingTasks
                  );

        pMem = OS_MEM.DbgNextPtr;
    }
}

function UpdateFlagGroups(Window)
{
    var pFlagGroup;
    var OS_FLAG_GRP;

    var flagGroup_ID;
    var flagGroup_Name;
    var flagGroup_Flags;
    var flagGroup_LastPosted;
    var flagGroup_WaitingTasks;


    pFlagGroup = Debug.evaluate("OSMemDbgListPtr");

    while ((pFlagGroup != 0) && (pFlagGroup != undefined))
    {
        OS_FLAG_GRP = Debug.evaluate("*(OS_FLAG_GRP*)" + pFlagGroup);

       flagGroup_ID            = "0x" + pFlagGroup.toString(16).toUpperCase();
       flagGroup_Name          = GetObjectName(OBJECT_TYPE_FLAG_GROUP, pFlagGroup);
       flagGroup_Flags         = OS_FLAG_GRP.Flags.toString(16).toUpperCase();
       flagGroup_LastPosted    = OS_FLAG_GRP.TS
       flagGroup_WaitingTasks  = ""

        // Update information in the plug in window
        // "Id"     , "Name" , "Flags"    , " Last Posted" , "Waiting Tasks"
        Window.add2( window_FlagGroups,
                     flagGroup_ID,
                     flagGroup_Name,
                     flagGroup_Flags,
                     flagGroup_LastPosted,
                     flagGroup_WaitingTasks
                  );

        pFlagGroup = OS_FLAG_GRP.DbgNextPtr;
    }
}

function UpdateSystemInformation(Window)
{
    var Status;
    var SystemTime;
    var systemInformation_CurrentTask;
    var Libmode;
    var VersionNum;
    var Version;
    var systemInformation_MessagePool;
    var OS_MSG_POOL;
    var systemInformation_TickList;


    VersionNum   = Debug.evaluate("OSDbg_VersionNbr");

    OS_MSG_POOL = Debug.evaluate("OSMsgPool");

    systemInformation_MessagePool = GetUtilizationString(OS_MSG_POOL.NbrUsedMax,OS_MSG_POOL.NbrFree + OS_MSG_POOL.NbrUsed );
    systemInformation_TickList    = Debug.evaluate("OSTickList").NbrEntries



    if(Debug.evaluate("OSInitialized"))
    {
        if(Debug.evaluate("OSRunning"))
        {
            Status = "RTOS Running";
        }
        else
        {
            Status = "RTOS Initialized";
        }
    }
    else
    {
        Status = "RTOS Not Initialized";
    }

    versionString = VersionNum.toString().split("");
    majorNum = versionString[1]
    minorNum = versionString[2] + versionString[3]
    patchNum = versionString[4] + versionString[5]

    Version = "V" + majorNum + "." + minorNum + "." + patchNum;

    Window.add2(window_SystemInformation , "uC/OS-III Version"        , Version);
    Window.add2(window_SystemInformation , "System Status"                 , Status);
    Window.add2(window_SystemInformation , "ISR Stack Utilization"         , GetUtilizationString( Debug.evaluate("OSISRStkUsed"), Debug.evaluate("OSISRStkFree")+Debug.evaluate("OSISRStkUsed")));
    Window.add2(window_SystemInformation , "Overall Interrupt Disable Time", Debug.evaluate("OSIntDisTimeMax"));
    Window.add2(window_SystemInformation , "ISR Nesting Level"             , Debug.evaluate("OSIntNestingCtr"));

    Window.add2(window_SystemInformation , "System Tick Value"        , Debug.evaluate("OSTickCtr"));

    Window.add2(window_SystemInformation , "Current Task"                    , GetObjectName(OBJECT_TYPE_TASK, Debug.evaluate("OSTCBCurPtr")));
    Window.add2(window_SystemInformation , "Current Task Priority"           , Debug.evaluate("OSPrioCur"));
    Window.add2(window_SystemInformation , "Highest Priority of Ready Tasks" , Debug.evaluate("OSPrioHighRdy"));

    Window.add2(window_SystemInformation , "Message Pool Utilization" , systemInformation_MessagePool);
    Window.add2(window_SystemInformation , "Tick List Entries"        , systemInformation_TickList);

    Window.add2(window_SystemInformation , "# Memory Partitions"      , Debug.evaluate("OSMemQty"));
    Window.add2(window_SystemInformation , "# Mutexes"                , Debug.evaluate("OSMutexQty"));
    Window.add2(window_SystemInformation , "# Timers"                 , Debug.evaluate("OSTmrQty"));
    Window.add2(window_SystemInformation , "# Tasks"                  , Debug.evaluate("OSTaskQty"));
    Window.add2(window_SystemInformation , "# Semaphores"             , Debug.evaluate("OSSemQty"));
    Window.add2(window_SystemInformation , "# Message Queues"         , Debug.evaluate("OSQQty"));
    Window.add2(window_SystemInformation , "# Flags"                  , Debug.evaluate("OSFlagQty"));


    Window.add2(window_SystemInformation , "App Redzone Hook"            , GetFuctionAddressAndNameString(Debug.evaluate(" OS_AppRedzoneHitHookPtr")));
    Window.add2(window_SystemInformation , "App Task Create Hook"        , GetFuctionAddressAndNameString(Debug.evaluate(" OS_AppTaskCreateHookPtr")));
    Window.add2(window_SystemInformation , "App Task Delete Hook"        , GetFuctionAddressAndNameString(Debug.evaluate(" OS_AppTaskDelHookPtr"   )));
    Window.add2(window_SystemInformation , "App Task Return Hook"        , GetFuctionAddressAndNameString(Debug.evaluate(" OS_AppTaskReturnHookPtr")));
    Window.add2(window_SystemInformation , "App Idle Task Hook"          , GetFuctionAddressAndNameString(Debug.evaluate(" OS_AppIdleTaskHookPtr"  )));
    Window.add2(window_SystemInformation , "App Stat Task Hook"          , GetFuctionAddressAndNameString(Debug.evaluate(" OS_AppStatTaskHookPtr"  )));
    Window.add2(window_SystemInformation , "App Task Context Switch Hook", GetFuctionAddressAndNameString(Debug.evaluate(" OS_AppTaskSwHookPtr"    )));
    Window.add2(window_SystemInformation , "App Time Tick Hook"          , GetFuctionAddressAndNameString(Debug.evaluate(" OS_AppTimeTickHookPtr"  )));


    Window.add2(window_SystemInformation , "# Tasks Context Switches" , Debug.evaluate("OSTaskCtxSwCtr"));
}

/*********************************************************************
*
*       Kernel Awareness API Functions
*
**********************************************************************
*/

/*********************************************************************
*
*       init()
*
*  Functions description:
*    This function describes the look of the threads window.
*/
function init()
{
    Threads.clear();
    Threads.setColumns("Id", "Priority", "Name", "CPU Usage", "State", "Pend On", "Pend Status", "Timeout", "Stack", "Stack Utilization", "Run Count", "Time Slice", "Options", "Task Events");
    Threads.setSortByNumber("Priority");
    Threads.setSortByNumber("Timeout");
    Threads.setSortByNumber("Run Count");
    Threads.setSortByNumber("Id");
    Threads.setSortByNumber("Time Slice");
    Threads.setSortByNumber("Task Events");
    Threads.setSortByNumber("Stack Info");
    
    if (Threads.setColor)
    {
        Threads.setColor("State", "Ready", "Executing", "Waiting");
    }

    if (Threads.setColumns2)
    {
        /*
            First argument is always the table name
        */
        Threads.setColumns2(window_Timers            , "Id"     , "Name" , "Callback" , "Delay"        , "Timeout"          , "Period"        , "State" , "Option" );
        Threads.setColumns2(window_Mutexes           , "Id"     , "Name" , "Owner   " , "Use Counter"  , "Last Released"    , "Waiting Tasks"                      );
        Threads.setColumns2(window_MemoryPartitions  , "Id"     , "Name" , "Buffer"   , "Utilization"  , "Block Size"       , "Waiting Tasks"                      );
        Threads.setColumns2(window_FlagGroups        , "Id"     , "Name" , "Flags"    , " Last Posted" , "Waiting Tasks"                                           );
        Threads.setColumns2(window_Semaphores        , "Id"     , "Name" , "Count"    , "Last Posted"  , "Waiting Tasks"                                           );
        Threads.setColumns2(window_Queues            , "Id"     , "Name" , "Buffer"   , "Utilization"  , "Peak Utilization"                                        );
        Threads.setColumns2(window_SystemInformation , ""       , "Value"                                                                                          );
    }
}

/*********************************************************************
*
*       update()
*
*  Functions description:
*    This function is called to update the threads window and its
*    entries upon debug stop.
*/
function update()
{
    //
    // Clear entire threads window
    //
    Threads.clear();
    //
    // Update plug in lists
    //

    if (Threads.newqueue2 != undefined) {
        if (Threads.shown(window_Timers))             UpdateTimers(Threads);
        if (Threads.shown(window_Queues))             UpdateQueues(Threads);
        if (Threads.shown(window_Mutexes))            UpdateMutexes(Threads);
        if (Threads.shown(window_Semaphores))         UpdateSemaphores(Threads);
        if (Threads.shown(window_MemoryPartitions))   UpdateMemoryPartitions(Threads);
        if (Threads.shown(window_FlagGroups))         UpdateFlagGroups(Threads);
        if (Threads.shown(window_SystemInformation))  UpdateSystemInformation(Threads);
    }
    // Must always be called for proper operation of RTOS plugin. 
    UpdateTasks(Threads);
}

function getregs(hTask)
{
    var i;
    var tcb;
    var aRegs = new Array(16);

    // copy the registers stored on the task stack to the output array
    for (i = 0; i < 16; i++)
    {
        aRegs[i] =0;
    }
    return aRegs;
}

/**********************************************************************
*
*     getname
*
* Function description*
*    Returns the name of a task.
*
* Parameters
*   hTask: see the description of method getregs.
*
**********************************************************************
*/
function getname(hTask)
{
    return GetObjectName(OBJECT_TYPE_TASK, Debug.evaluate("*(OS_TCB*)" + hTask));
}

/*********************************************************************
*
*       getOSName()
*
*  Functions description:
*    Returns the name of the RTOS this script supplies support for
*/
function getOSName()
{
    return "uC/OS-III";
}

/*********************************************************************
*
*       gettls()
*
*  Functions description:
*    This function is called to retrieve the TLS address of the
*    specified task.
*/
function gettls(pTask)
{
    var pTLS;

    //
    // If null is passed to gettls(pTask), get the current task.
    //
    if (pTask == null)
    {
        pTask = Debug.evaluate("OSTCBCurPtr");
    }
    //
    // Load the pTLS address of the selected task.
    //
    pTLS = Debug.evaluate("(*(OS_TCB*)" + pTask + ").OS_TLS");

    //
    // If the selected task does not use TLS, load tbss section address instead.
    //
    if ((pTLS == 0) || (pTLS == undefined))
    {
        pTLS = Debug.evaluate("__tbss_start__");
    }

    return pTLS;
}

/*********************************************************************
*
*       getContextSwitchAddrs()
*
*  Functions description:
*    Returns an unsigned integer array containing the base addresses 
*    of all functions that complete a task switch when executed.
*/
function getContextSwitchAddrs()
{
    var aAddrs;
    var Addr;

    aAddrs = [];
    Addr = Debug.evaluate("&OSCtxSW");

    if (Addr != undefined)
    {
        aAddrs[0] = Addr;
    }

    Addr = Debug.evaluate("&OSIntCtxSW");

    if (Addr != undefined)
    {
        aAddrs.push(Addr);
    }

    return aAddrs;
}