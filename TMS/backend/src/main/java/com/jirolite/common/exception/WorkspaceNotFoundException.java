package com.jirolite.common.exception;

public class WorkspaceNotFoundException extends RuntimeException {
    public WorkspaceNotFoundException() {
        super("Workspace not found");
    }
}
