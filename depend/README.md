# Depend
**Depend** is an event-driven esolang.

Each line takes the form of a series of two or more strings of alphanumeric characters and underscores. The first two are separated by a dash and greater-than sign, and the rest are separated by commas. Alternatively, a line can be just one such string followed by a dash and greater-than sign.

Each line symbolizes an *event* whose ID is the line's first string. The rest of the line's strings are that event's *dependencies*, which are other events (given as IDs). If the event has no dependencies, then it can finish immediately; otherwise, it has to wait until all its dependencies have finished. It is undefined behaviour if an event has itself or an undefined event as a dependency. Empty dependencies (the empty string) are ignored.
